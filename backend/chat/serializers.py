from rest_framework import serializers
from .models import ChatRoom, ChatParticipant, Message, ChatNotification
from accounts.serializers import UserProfileSerializer as UserSerializer


class ChatParticipantSerializer(serializers.ModelSerializer):
    """Serializer for chat participants"""
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    unread_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ChatParticipant
        fields = [
            'id', 'user', 'user_id', 'role', 'role_display', 'joined_at', 
            'last_read_at', 'is_active', 'unread_count'
        ]
        read_only_fields = ['id', 'joined_at', 'unread_count']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    sender = UserSerializer(read_only=True)
    sender_id = serializers.UUIDField(write_only=True)
    message_type_display = serializers.CharField(source='get_message_type_display', read_only=True)
    display_content = serializers.CharField(read_only=True)
    reply_to = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'chat_room', 'sender', 'sender_id', 'message_type', 
            'message_type_display', 'content', 'file_url', 'file_name', 
            'file_size', 'reply_to', 'is_edited', 'edited_at', 'is_deleted', 
            'deleted_at', 'created_at', 'updated_at', 'display_content'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'display_content']
    
    def get_reply_to(self, obj):
        """Serialize reply_to with sender information"""
        if obj.reply_to:
            return {
                'id': str(obj.reply_to.id),
                'content': obj.reply_to.content,
                'sender': {
                    'id': str(obj.reply_to.sender.id),
                    'username': obj.reply_to.sender.username,
                    'first_name': obj.reply_to.sender.first_name,
                    'last_name': obj.reply_to.sender.last_name
                }
            }
        return None


class ChatRoomSerializer(serializers.ModelSerializer):
    """Serializer for chat rooms"""
    created_by = UserSerializer(read_only=True)
    participants = ChatParticipantSerializer(source='chat_participants', many=True, read_only=True)
    participant_count = serializers.IntegerField(read_only=True)
    last_message = MessageSerializer(read_only=True)
    room_type_display = serializers.CharField(source='get_room_type_display', read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'room_type', 'room_type_display', 'description', 
            'created_by', 'participants', 'participant_count', 'last_message',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'participant_count', 'last_message']


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating chat rooms"""
    participant_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'room_type', 'description', 'participant_ids']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        chat_room = ChatRoom.objects.create(**validated_data)
        
        # Add other participants (creator is added in the viewset)
        for user_id in participant_ids:
            try:
                from accounts.models import User
                user = User.objects.get(id=user_id)
                ChatParticipant.objects.create(
                    chat_room=chat_room,
                    user=user,
                    role='member'
                )
            except User.DoesNotExist:
                pass
        
        return chat_room


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages"""
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['chat_room', 'message_type', 'content', 'file_url', 'file_name', 'file_size', 'reply_to', 'sender']
        read_only_fields = ['sender']
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)
    
    def to_representation(self, instance):
        """Use the full MessageSerializer for representation"""
        return MessageSerializer(instance, context=self.context).data


class MessageUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating messages"""
    
    class Meta:
        model = Message
        fields = ['content']
    
    def update(self, instance, validated_data):
        instance.edit_message(validated_data['content'])
        return instance


class ChatNotificationSerializer(serializers.ModelSerializer):
    """Serializer for chat notifications"""
    recipient = UserSerializer(read_only=True)
    chat_room = ChatRoomSerializer(read_only=True)
    message = MessageSerializer(read_only=True)
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = ChatNotification
        fields = [
            'id', 'recipient', 'chat_room', 'message', 'notification_type',
            'notification_type_display', 'content', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ChatRoomListSerializer(serializers.ModelSerializer):
    """Simplified serializer for chat room listings"""
    participant_count = serializers.IntegerField(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    room_type_display = serializers.CharField(source='get_room_type_display', read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'room_type', 'room_type_display', 'description',
            'participant_count', 'last_message', 'unread_count', 'updated_at'
        ]
    
    def get_last_message(self, obj):
        last_message = obj.last_message
        if last_message:
            return {
                'id': str(last_message.id),
                'content': last_message.display_content,
                'sender': last_message.sender.username,
                'created_at': last_message.created_at
            }
        return None
    
    def get_unread_count(self, obj):
        user = self.context['request'].user
        try:
            participant = obj.chat_participants.get(user=user)
            return participant.unread_count
        except ChatParticipant.DoesNotExist:
            return 0


class ChatRoomDetailSerializer(ChatRoomSerializer):
    """Detailed serializer for chat room with messages"""
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta(ChatRoomSerializer.Meta):
        fields = ChatRoomSerializer.Meta.fields + ['messages']


class OnlineUserSerializer(serializers.Serializer):
    """Serializer for online users in a chat room"""
    user = UserSerializer()
    is_online = serializers.BooleanField()
    last_seen = serializers.DateTimeField() 