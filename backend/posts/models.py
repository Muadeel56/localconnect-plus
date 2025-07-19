from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinLengthValidator
from django.utils import timezone

User = get_user_model()

class Post(models.Model):
    """
    Post model for help requests and community posts
    """
    class Category(models.TextChoices):
        GENERAL = 'GENERAL', 'General'
        FOOD = 'FOOD', 'Food & Groceries'
        TRANSPORT = 'TRANSPORT', 'Transportation'
        MEDICAL = 'MEDICAL', 'Medical & Health'
        EDUCATION = 'EDUCATION', 'Education'
        TECHNOLOGY = 'TECHNOLOGY', 'Technology'
        OTHER = 'OTHER', 'Other'
    
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        CLOSED = 'CLOSED', 'Closed'
        RESOLVED = 'RESOLVED', 'Resolved'
    
    # Basic fields
    title = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(10)],
        help_text="Post title (minimum 10 characters)"
    )
    
    content = models.TextField(
        validators=[MinLengthValidator(20)],
        help_text="Post content (minimum 20 characters)"
    )
    
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.GENERAL,
        help_text="Post category"
    )
    
    location = models.CharField(
        max_length=100,
        blank=True,
        help_text="Location relevant to this post"
    )
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
        help_text="Current status of the post"
    )
    
    # Relationships
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts',
        help_text="User who created this post"
    )
    
    # Soft delete
    is_deleted = models.BooleanField(
        default=False,
        help_text="Soft delete flag"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Post"
        verbose_name_plural = "Posts"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['status']),
            models.Index(fields=['author']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} by {self.author.username}"
    
    @property
    def comment_count(self):
        """Get the number of comments on this post"""
        return self.comments.filter(is_deleted=False).count()
    
    def soft_delete(self):
        """Soft delete the post"""
        self.is_deleted = True
        self.save(update_fields=['is_deleted'])
    
    def can_be_edited_by(self, user):
        """Check if user can edit this post"""
        return user == self.author or user.is_admin
    
    def can_be_deleted_by(self, user):
        """Check if user can delete this post"""
        return user == self.author or user.is_admin


class Comment(models.Model):
    """
    Comment model for posts with threading support
    """
    # Content
    content = models.TextField(
        validators=[MinLengthValidator(1)],
        help_text="Comment content"
    )
    
    # Relationships
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="Post this comment belongs to"
    )
    
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="User who wrote this comment"
    )
    
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        help_text="Parent comment for threading"
    )
    
    # Soft delete
    is_deleted = models.BooleanField(
        default=False,
        help_text="Soft delete flag"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Comment"
        verbose_name_plural = "Comments"
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['author']),
            models.Index(fields=['parent']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"
    
    @property
    def reply_count(self):
        """Get the number of replies to this comment"""
        return self.replies.filter(is_deleted=False).count()
    
    @property
    def depth(self):
        """Get the depth of this comment in the thread"""
        depth = 0
        parent = self.parent
        while parent:
            depth += 1
            parent = parent.parent
        return depth
    
    def soft_delete(self):
        """Soft delete the comment"""
        self.is_deleted = True
        self.save(update_fields=['is_deleted'])
    
    def can_be_edited_by(self, user):
        """Check if user can edit this comment"""
        return user == self.author or user.is_admin
    
    def can_be_deleted_by(self, user):
        """Check if user can delete this comment"""
        return user == self.author or user.is_admin or user.can_moderate_posts()
