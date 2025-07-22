from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Post, Comment


@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    """
    Create notification when a new comment is created
    """
    if created and not instance.is_deleted:
        try:
            from notifications.models import Notification
            # Create notification for the post author
            Notification.create_comment_notification(instance, instance.post)
        except ImportError:
            # Notifications app not available
            pass


@receiver(post_save, sender=Comment)
def create_reply_notification(sender, instance, created, **kwargs):
    """
    Create notification when a reply is created
    """
    if created and not instance.is_deleted and instance.parent:
        try:
            from notifications.models import Notification
            # Create notification for the parent comment author
            Notification.create_reply_notification(instance, instance.parent)
        except ImportError:
            # Notifications app not available
            pass


@receiver(post_save, sender=Post)
def create_post_status_notification(sender, instance, **kwargs):
    """
    Create notification when post status changes
    """
    if instance.pk:  # Only for existing posts
        try:
            from notifications.models import Notification
            # Get the old status from the database
            old_instance = Post.objects.get(pk=instance.pk)
            if old_instance.status != instance.status:
                Notification.create_post_status_notification(
                    instance, 
                    old_instance.status, 
                    instance.status
                )
        except (ImportError, Post.DoesNotExist):
            # Notifications app not available or post doesn't exist
            pass 