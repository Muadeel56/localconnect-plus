from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from .models import ChatRoom, ChatParticipant, Message, ChatNotification
from .serializers import (
    ChatRoomSerializer, ChatRoomCreateSerializer, ChatRoomListSerializer, ChatRoomDetailSerializer,
    MessageSerializer, MessageCreateSerializer, MessageUpdateSerializer,
    ChatParticipantSerializer, ChatNotificationSerializer, OnlineUserSerializer
)
from accounts.permissions import IsOwnerOrAdmin
from .permissions import IsParticipantOrReadOnly


class ChatRoomViewSet(viewsets.ModelViewSet):
    """ViewSet for chat rooms"""
    queryset = ChatRoom.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ChatRoomCreateSerializer
        elif self.action == 'list':
            return ChatRoomListSerializer
        elif self.action == 'retrieve':
            return ChatRoomDetailSerializer
        return ChatRoomSerializer
    
    def get_queryset(self):
        """Return chat rooms where user is a participant"""
        user = self.request.user
        return ChatRoom.objects.filter(
            is_active=True,
            chat_participants__user=user,
            chat_participants__is_active=True
        ).distinct()
    
    def perform_create(self, serializer):
        """Create chat room and add creator as participant"""
        chat_room = serializer.save(created_by=self.request.user)
        
        # Add creator as admin participant
        ChatParticipant.objects.create(
            chat_room=chat_room,
            user=self.request.user,
            role='admin'
        )
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a chat room"""
        chat_room = self.get_object()
        user = request.user
        
        # Check if user is already a participant
        if ChatParticipant.objects.filter(chat_room=chat_room, user=user).exists():
            return Response({'detail': 'Already a participant'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add user as participant
        ChatParticipant.objects.create(
            chat_room=chat_room,
            user=user,
            role='member'
        )
        
        return Response({'detail': 'Successfully joined chat room'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a chat room"""
        chat_room = self.get_object()
        user = request.user
        
        try:
            participant = ChatParticipant.objects.get(chat_room=chat_room, user=user)
            participant.is_active = False
            participant.save()
            return Response({'detail': 'Successfully left chat room'}, status=status.HTTP_200_OK)
        except ChatParticipant.DoesNotExist:
            return Response({'detail': 'Not a participant'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        """Get participants of a chat room"""
        chat_room = self.get_object()
        participants = chat_room.chat_participants.filter(is_active=True)
        serializer = ChatParticipantSerializer(participants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def online_users(self, request, pk=None):
        """Get online users in a chat room"""
        chat_room = self.get_object()
        # This would typically integrate with a presence system
        # For now, return all active participants
        participants = chat_room.chat_participants.filter(is_active=True)
        online_users = []
        
        for participant in participants:
            online_users.append({
                'user': participant.user,
                'is_online': True,  # Placeholder
                'last_seen': participant.last_read_at or participant.joined_at
            })
        
        serializer = OnlineUserSerializer(online_users, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark all messages in chat room as read"""
        chat_room = self.get_object()
        user = request.user
        
        try:
            participant = ChatParticipant.objects.get(chat_room=chat_room, user=user)
            participant.last_read_at = timezone.now()
            participant.save()
            return Response({'detail': 'Marked as read'}, status=status.HTTP_200_OK)
        except ChatParticipant.DoesNotExist:
            return Response({'detail': 'Not a participant'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_participant(self, request, pk=None):
        """Add a participant to the chat room (admin only)"""
        chat_room = self.get_object()
        user = request.user
        
        # Check if user is admin of the chat room
        try:
            user_participant = ChatParticipant.objects.get(
                chat_room=chat_room,
                user=user,
                role='admin'
            )
        except ChatParticipant.DoesNotExist:
            return Response({'detail': 'Only admins can add participants'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get user to add
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'detail': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from accounts.models import User
            user_to_add = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is already a participant
        if ChatParticipant.objects.filter(chat_room=chat_room, user=user_to_add).exists():
            return Response({'detail': 'User is already a participant'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add user as participant
        ChatParticipant.objects.create(
            chat_room=chat_room,
            user=user_to_add,
            role='member'
        )
        
        return Response({'detail': f'Added {user_to_add.username} to the chat room'}, status=status.HTTP_200_OK)


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for chat messages"""
    queryset = Message.objects.filter(is_deleted=False)
    permission_classes = [permissions.IsAuthenticated, IsParticipantOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return MessageUpdateSerializer
        return MessageSerializer
    
    def get_queryset(self):
        """Return messages from chat rooms where user is a participant"""
        user = self.request.user
        return Message.objects.filter(
            is_deleted=False,
            chat_room__chat_participants__user=user,
            chat_room__chat_participants__is_active=True
        ).select_related('sender', 'chat_room').order_by('created_at')
    
    def perform_create(self, serializer):
        """Create message and update chat room"""
        message = serializer.save(sender=self.request.user)
        
        # Update chat room's updated_at timestamp
        message.chat_room.save()
        
        # Create notifications for other participants
        participants = message.chat_room.chat_participants.filter(
            is_active=True
        ).exclude(user=self.request.user)
        
        for participant in participants:
            ChatNotification.objects.create(
                recipient=participant.user,
                chat_room=message.chat_room,
                message=message,
                notification_type='message',
                content=f'New message from {self.request.user.username}'
            )
    
    def perform_destroy(self, instance):
        """Soft delete message"""
        instance.soft_delete()
    
    @action(detail=True, methods=['post'])
    def edit(self, request, pk=None):
        """Edit a message"""
        message = self.get_object()
        
        # Check if user is the sender
        if message.sender != request.user:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        new_content = request.data.get('content')
        if not new_content:
            return Response({'detail': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        message.edit_message(new_content)
        serializer = self.get_serializer(message)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """Reply to a message"""
        original_message = self.get_object()
        
        content = request.data.get('content')
        if not content:
            return Response({'detail': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create reply message
        reply_message = Message.objects.create(
            chat_room=original_message.chat_room,
            sender=request.user,
            content=content,
            message_type='text',
            reply_to=original_message
        )
        
        # Update chat room's updated_at timestamp
        reply_message.chat_room.save()
        
        serializer = self.get_serializer(reply_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def by_room(self, request):
        """Get messages by chat room"""
        room_id = request.query_params.get('room_id')
        if not room_id:
            return Response({'detail': 'room_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get all messages for the room, not filtered by user participation
        messages = Message.objects.filter(
            chat_room_id=room_id,
            is_deleted=False
        ).select_related('sender', 'chat_room').order_by('created_at')
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)


class ChatParticipantViewSet(viewsets.ModelViewSet):
    """ViewSet for chat participants"""
    queryset = ChatParticipant.objects.filter(is_active=True)
    serializer_class = ChatParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return participants from chat rooms where user is a participant"""
        user = self.request.user
        return ChatParticipant.objects.filter(
            is_active=True,
            chat_room__chat_participants__user=user,
            chat_room__chat_participants__is_active=True
        ).select_related('user', 'chat_room')
    
    @action(detail=True, methods=['post'])
    def update_role(self, request, pk=None):
        """Update participant role (admin only)"""
        participant = self.get_object()
        user = request.user
        
        # Check if user is admin of the chat room
        try:
            user_participant = ChatParticipant.objects.get(
                chat_room=participant.chat_room,
                user=user,
                role='admin'
            )
        except ChatParticipant.DoesNotExist:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        new_role = request.data.get('role')
        if new_role not in dict(ChatParticipant.PARTICIPANT_ROLES):
            return Response({'detail': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        
        participant.role = new_role
        participant.save()
        serializer = self.get_serializer(participant)
        return Response(serializer.data)


class ChatNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for chat notifications"""
    queryset = ChatNotification.objects.all()
    serializer_class = ChatNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return notifications for the current user"""
        return ChatNotification.objects.filter(recipient=self.request.user).select_related(
            'chat_room', 'message', 'recipient'
        )
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'detail': 'Marked as read'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        notifications = self.get_queryset().filter(is_read=False)
        notifications.update(is_read=True)
        return Response({'detail': 'All notifications marked as read'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)
