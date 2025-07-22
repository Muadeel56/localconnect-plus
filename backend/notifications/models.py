from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

User = get_user_model()


class Notification(models.Model):
    """
    Notification model for handling various types of notifications
    """
    NOTIFICATION_TYPES = [
        ('COMMENT', 'New Comment'),
        ('REPLY', 'New Reply'),
        ('POST_STATUS', 'Post Status Change'),
        ('MENTION', 'User Mention'),
        ('ADMIN', 'Admin Notification'),
        ('SYSTEM', 'System Notification'),
    ]
    
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='SYSTEM'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Generic foreign key for linking to any model (post, comment, etc.)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Additional data for the notification
    data = models.JSONField(default=dict, blank=True)
    
    # Read status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.notification_type} - {self.recipient.username}: {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def mark_as_unread(self):
        """Mark notification as unread"""
        if self.is_read:
            self.is_read = False
            self.read_at = None
            self.save(update_fields=['is_read', 'read_at'])
    
    @classmethod
    def create_notification(cls, recipient, notification_type, title, message, content_object=None, data=None):
        """
        Create a new notification
        """
        notification = cls.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            message=message,
            content_object=content_object,
            data=data or {}
        )
        return notification
    
    @classmethod
    def create_comment_notification(cls, comment, post):
        """
        Create notification for new comment on a post
        """
        if comment.author != post.author:  # Don't notify the post author of their own comment
            return cls.create_notification(
                recipient=post.author,
                notification_type='COMMENT',
                title=f'New comment on "{post.title}"',
                message=f'{comment.author.username} commented on your post: "{comment.content[:100]}{"..." if len(comment.content) > 100 else ""}',
                content_object=comment,
                data={
                    'post_id': post.id,
                    'post_title': post.title,
                    'comment_id': comment.id,
                    'comment_author': comment.author.username
                }
            )
        return None
    
    @classmethod
    def create_reply_notification(cls, reply, parent_comment):
        """
        Create notification for new reply to a comment
        """
        if reply.author != parent_comment.author:  # Don't notify the comment author of their own reply
            return cls.create_notification(
                recipient=parent_comment.author,
                notification_type='REPLY',
                title=f'New reply to your comment',
                message=f'{reply.author.username} replied to your comment: "{reply.content[:100]}{"..." if len(reply.content) > 100 else ""}',
                content_object=reply,
                data={
                    'post_id': reply.post.id,
                    'post_title': reply.post.title,
                    'comment_id': reply.id,
                    'reply_author': reply.author.username,
                    'parent_comment_id': parent_comment.id
                }
            )
        return None
    
    @classmethod
    def create_post_status_notification(cls, post, old_status, new_status):
        """
        Create notification for post status change
        """
        status_messages = {
            'CLOSED': 'Your post has been closed',
            'RESOLVED': 'Your post has been marked as resolved',
            'IN_PROGRESS': 'Your post is now in progress',
            'OPEN': 'Your post has been reopened'
        }
        
        if new_status in status_messages:
            return cls.create_notification(
                recipient=post.author,
                notification_type='POST_STATUS',
                title=f'Post status updated: {new_status}',
                message=status_messages[new_status],
                content_object=post,
                data={
                    'post_id': post.id,
                    'post_title': post.title,
                    'old_status': old_status,
                    'new_status': new_status
                }
            )
        return None
    
    @classmethod
    def create_mention_notification(cls, mentioned_user, mentioner, content, content_object):
        """
        Create notification for user mention
        """
        return cls.create_notification(
            recipient=mentioned_user,
            notification_type='MENTION',
            title=f'You were mentioned by {mentioner.username}',
            message=f'{mentioner.username} mentioned you in a post or comment',
            content_object=content_object,
            data={
                'mentioner_id': mentioner.id,
                'mentioner_username': mentioner.username,
                'content_preview': content[:100]
            }
        )
    
    @classmethod
    def create_admin_notification(cls, recipient, title, message, data=None):
        """
        Create admin notification
        """
        return cls.create_notification(
            recipient=recipient,
            notification_type='ADMIN',
            title=title,
            message=message,
            data=data or {}
        ) 