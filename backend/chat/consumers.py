import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import ChatRoom, ChatParticipant, Message, ChatNotification

# Set up logging
logger = logging.getLogger(__name__)

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat"""
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        logger.info(f"WebSocket connection attempt for room {self.room_id}")
        logger.info(f"User: {self.scope.get('user', 'No user in scope')}")
        
        # Check if user is authenticated
        if not self.scope['user'].is_authenticated:
            logger.warning(f"Unauthorized connection attempt for room {self.room_id}")
            await self.close(code=4001)  # Custom close code for unauthorized
            return
        
        # Check if user is participant of the chat room
        is_participant = await self.is_participant()
        if not is_participant:
            logger.warning(f"User {self.scope['user'].username} is not a participant in room {self.room_id}")
            await self.close(code=4003)  # Custom close code for not a participant
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"WebSocket connection accepted for user {self.scope['user'].username} in room {self.room_id}")
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'room_id': self.room_id,
            'user': self.scope['user'].username
        }))
        
        # Update user's online status
        await self.update_user_status(True)
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Update user's online status
        await self.update_user_status(False)
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'chat_message')
        
        if message_type == 'chat_message':
            await self.handle_chat_message(text_data_json)
        elif message_type == 'typing':
            await self.handle_typing(text_data_json)
        elif message_type == 'read_messages':
            await self.handle_read_messages(text_data_json)
    
    async def handle_chat_message(self, data):
        """Handle chat message"""
        message_content = data.get('message', '').strip()
        message_type = data.get('message_type', 'text')
        file_url = data.get('file_url', '')
        file_name = data.get('file_name', '')
        file_size = data.get('file_size', 0)
        
        if not message_content and message_type == 'text':
            return
        
        # Save message to database
        message = await self.save_message(
            message_content, message_type, file_url, file_name, file_size
        )
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': str(message.id),
                    'content': message.content,
                    'message_type': message.message_type,
                    'file_url': message.file_url,
                    'file_name': message.file_name,
                    'file_size': message.file_size,
                    'sender': {
                        'id': str(message.sender.id),
                        'username': message.sender.username,
                        'profile_picture': message.sender.profile_picture.url if message.sender.profile_picture else None
                    },
                    'created_at': message.created_at.isoformat(),
                    'is_edited': message.is_edited,
                    'edited_at': message.edited_at.isoformat() if message.edited_at else None
                }
            }
        )
        
        # Create notifications for other participants
        await self.create_notifications(message)
    
    async def handle_typing(self, data):
        """Handle typing indicator"""
        is_typing = data.get('is_typing', False)
        
        # Send typing indicator to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_typing',
                'user': self.scope['user'].username,
                'is_typing': is_typing
            }
        )
    
    async def handle_read_messages(self, data):
        """Handle marking messages as read"""
        await self.mark_messages_as_read()
        
        # Send read confirmation to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'messages_read',
                'user': self.scope['user'].username,
                'timestamp': timezone.now().isoformat()
            }
        )
    
    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))
    
    async def user_typing(self, event):
        """Send typing indicator to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'typing',  # Changed from 'user_typing' to 'typing'
            'user': event['user'],
            'is_typing': event['is_typing']
        }))
    
    async def messages_read(self, event):
        """Send read confirmation to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'messages_read',
            'user': event['user'],
            'timestamp': event['timestamp']
        }))
    
    @database_sync_to_async
    def is_participant(self):
        """Check if user is participant of the chat room"""
        try:
            return ChatParticipant.objects.filter(
                chat_room_id=self.room_id,
                user=self.scope['user'],
                is_active=True
            ).exists()
        except:
            return False
    
    @database_sync_to_async
    def save_message(self, content, message_type, file_url, file_name, file_size):
        """Save message to database"""
        try:
            chat_room = ChatRoom.objects.get(id=self.room_id)
            message = Message.objects.create(
                chat_room=chat_room,
                sender=self.scope['user'],
                message_type=message_type,
                content=content,
                file_url=file_url,
                file_name=file_name,
                file_size=file_size
            )
            
            # Update chat room's updated_at timestamp
            chat_room.save()
            
            return message
        except ChatRoom.DoesNotExist:
            return None
    
    @database_sync_to_async
    def create_notifications(self, message):
        """Create notifications for other participants"""
        participants = ChatParticipant.objects.filter(
            chat_room=message.chat_room,
            is_active=True
        ).exclude(user=message.sender)
        
        notifications = []
        for participant in participants:
            notifications.append(
                ChatNotification(
                    recipient=participant.user,
                    chat_room=message.chat_room,
                    message=message,
                    notification_type='message',
                    content=f'New message from {message.sender.username}'
                )
            )
        
        if notifications:
            ChatNotification.objects.bulk_create(notifications)
    
    @database_sync_to_async
    def mark_messages_as_read(self):
        """Mark messages as read for the user"""
        try:
            participant = ChatParticipant.objects.get(
                chat_room_id=self.room_id,
                user=self.scope['user']
            )
            participant.last_read_at = timezone.now()
            participant.save()
        except ChatParticipant.DoesNotExist:
            pass
    
    @database_sync_to_async
    def update_user_status(self, is_online):
        """Update user's online status"""
        # This would typically update a presence system
        # For now, we'll just update the last_read_at timestamp
        try:
            participant = ChatParticipant.objects.get(
                chat_room_id=self.room_id,
                user=self.scope['user']
            )
            if is_online:
                participant.last_read_at = timezone.now()
            participant.save()
        except ChatParticipant.DoesNotExist:
            pass


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time notifications"""
    
    async def connect(self):
        """Handle WebSocket connection"""
        if not self.scope['user'].is_authenticated:
            await self.close()
            return
        
        self.user_group_name = f'notifications_{self.scope["user"].id}'
        
        # Join user's notification group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'notification_connection_established',
            'user_id': str(self.scope['user'].id)
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        # Notifications are typically one-way from server to client
        pass
    
    async def notification_message(self, event):
        """Send notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))
    
    async def chat_notification(self, event):
        """Send chat notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_notification',
            'notification': event['notification']
        })) 