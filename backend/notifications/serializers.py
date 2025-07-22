from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model
    """
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'notification_type_display', 'title', 'message',
            'data', 'is_read', 'created_at', 'time_ago'
        ]
        read_only_fields = ['id', 'created_at', 'time_ago']
    
    def get_time_ago(self, obj):
        """Return human-readable time ago"""
        from django.utils import timezone
        from datetime import datetime
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        else:
            return "Just now"


class NotificationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating notifications
    """
    class Meta:
        model = Notification
        fields = ['notification_type', 'title', 'message', 'data']


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating notifications (mainly for marking as read)
    """
    class Meta:
        model = Notification
        fields = ['is_read']


class NotificationSummarySerializer(serializers.ModelSerializer):
    """
    Serializer for notification summary (unread count, etc.)
    """
    unread_count = serializers.SerializerMethodField()
    recent_notifications = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['unread_count', 'recent_notifications']
    
    def get_unread_count(self, obj):
        """Get unread notification count for the user"""
        user = self.context['request'].user
        return Notification.objects.filter(recipient=user, is_read=False).count()
    
    def get_recent_notifications(self, obj):
        """Get recent notifications for the user"""
        user = self.context['request'].user
        recent = Notification.objects.filter(recipient=user).order_by('-created_at')[:5]
        return NotificationSerializer(recent, many=True).data 