from rest_framework import permissions
from .models import ChatParticipant


class IsParticipantOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow participants of a chat room to modify messages.
    """
    
    def has_permission(self, request, view):
        # Allow read operations for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # For write operations, check if user is participant
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Allow read operations for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # For write operations, check if user is participant of the chat room
        if hasattr(obj, 'chat_room'):
            chat_room = obj.chat_room
        elif hasattr(obj, 'room'):
            chat_room = obj.room
        else:
            return False
        
        return ChatParticipant.objects.filter(
            chat_room=chat_room,
            user=request.user,
            is_active=True
        ).exists()


class IsChatRoomAdmin(permissions.BasePermission):
    """
    Custom permission to only allow chat room admins to perform certain actions.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Get the chat room from the object
        if hasattr(obj, 'chat_room'):
            chat_room = obj.chat_room
        elif hasattr(obj, 'room'):
            chat_room = obj.room
        else:
            chat_room = obj
        
        # Check if user is admin of the chat room
        return ChatParticipant.objects.filter(
            chat_room=chat_room,
            user=request.user,
            role='admin',
            is_active=True
        ).exists()


class IsMessageOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow message owner or chat room admin to modify messages.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Allow message owner to modify their own messages
        if obj.sender == request.user:
            return True
        
        # Allow chat room admin to modify any message in their room
        return ChatParticipant.objects.filter(
            chat_room=obj.chat_room,
            user=request.user,
            role='admin',
            is_active=True
        ).exists()


class IsNotificationOwner(permissions.BasePermission):
    """
    Custom permission to only allow notification owner to access their notifications.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        return obj.recipient == request.user


class CanJoinChatRoom(permissions.BasePermission):
    """
    Custom permission to check if user can join a chat room.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Check if user is already a participant
        if ChatParticipant.objects.filter(
            chat_room=obj,
            user=request.user,
            is_active=True
        ).exists():
            return False
        
        # For community rooms, anyone can join
        if obj.room_type == 'community':
            return True
        
        # For private rooms, only invited users can join
        # This would typically check against an invitation system
        # For now, allow all authenticated users
        return True 