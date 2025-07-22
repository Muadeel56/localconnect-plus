from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone

from .models import Notification
from .serializers import (
    NotificationSerializer, NotificationCreateSerializer,
    NotificationUpdateSerializer, NotificationSummarySerializer
)
from accounts.permissions import IsOwnerOrAdmin


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Notification model with CRUD operations and special actions
    """
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        """Filter notifications for the current user"""
        return Notification.objects.filter(recipient=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return NotificationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return NotificationUpdateSerializer
        elif self.action == 'summary':
            return NotificationSummarySerializer
        return NotificationSerializer
    
    def perform_create(self, serializer):
        """Set the recipient to the current user"""
        serializer.save(recipient=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        unread_notifications = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(unread_notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get notification summary (unread count, recent notifications)"""
        # Create a dummy object for the serializer
        dummy_notification = Notification()
        serializer = NotificationSummarySerializer(dummy_notification, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_unread(self, request, pk=None):
        """Mark a notification as unread"""
        notification = self.get_object()
        notification.mark_as_unread()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        updated_count = self.get_queryset().filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({
            'message': f'Marked {updated_count} notifications as read',
            'updated_count': updated_count
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_as_unread(self, request):
        """Mark all notifications as unread"""
        updated_count = self.get_queryset().filter(is_read=True).update(
            is_read=False,
            read_at=None
        )
        return Response({
            'message': f'Marked {updated_count} notifications as unread',
            'updated_count': updated_count
        })
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """Delete all notifications for the user"""
        deleted_count = self.get_queryset().delete()[0]
        return Response({
            'message': f'Deleted {deleted_count} notifications',
            'deleted_count': deleted_count
        })
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get notifications filtered by type"""
        notification_type = request.query_params.get('type')
        if notification_type:
            queryset = self.get_queryset().filter(notification_type=notification_type)
        else:
            queryset = self.get_queryset()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search notifications by title or message"""
        query = request.query_params.get('q', '')
        if query:
            queryset = self.get_queryset().filter(
                Q(title__icontains=query) | Q(message__icontains=query)
            )
        else:
            queryset = self.get_queryset()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data) 