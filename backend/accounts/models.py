from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

class User(AbstractUser):
    """
    Custom User model with role-based authentication
    """
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        VOLUNTEER = 'VOLUNTEER', 'Volunteer'
        USER = 'USER', 'User'
    
    # Role field
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER,
        help_text="User role in the system"
    )
    
    # Profile fields
    bio = models.TextField(
        max_length=500,
        blank=True,
        help_text="User biography"
    )
    
    location = models.CharField(
        max_length=100,
        blank=True,
        help_text="User location"
    )
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone = models.CharField(
        validators=[phone_regex],
        max_length=17,
        blank=True,
        help_text="Phone number"
    )
    
    # Email verification
    email_verified = models.BooleanField(
        default=False,
        help_text="Whether the user's email has been verified"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
    
    @property
    def is_volunteer(self):
        return self.role == self.Role.VOLUNTEER
    
    @property
    def is_regular_user(self):
        return self.role == self.Role.USER
    
    def can_moderate_posts(self):
        """Check if user can moderate posts"""
        return self.role in [self.Role.ADMIN, self.Role.VOLUNTEER]
    
    def can_manage_users(self):
        """Check if user can manage other users"""
        return self.role == self.Role.ADMIN

    def can_create_posts(self):
        """Check if user can create posts"""
        return self.is_authenticated and self.email_verified
    
    def can_edit_posts(self):
        """Check if user can edit posts"""
        return self.is_authenticated and (self.is_admin or self.is_volunteer)
    
    def can_delete_posts(self):
        """Check if user can delete posts"""
        return self.is_authenticated and (self.is_admin or self.is_volunteer)
    
    def can_create_comments(self):
        """Check if user can create comments"""
        return self.is_authenticated and self.email_verified
    
    def can_edit_comments(self):
        """Check if user can edit comments"""
        return self.is_authenticated and (self.is_admin or self.is_volunteer)
    
    def can_delete_comments(self):
        """Check if user can delete comments"""
        return self.is_authenticated and (self.is_admin or self.is_volunteer)
    
    def can_view_analytics(self):
        """Check if user can view analytics"""
        return self.is_authenticated and (self.is_admin or self.is_volunteer)
    
    def can_manage_roles(self):
        """Check if user can manage roles"""
        return self.is_authenticated and self.is_admin
    
    def can_access_admin_panel(self):
        """Check if user can access admin panel"""
        return self.is_authenticated and self.is_admin
    
    def can_promote_users(self):
        """Check if user can promote other users"""
        return self.is_authenticated and self.is_admin
    
    def can_demote_users(self):
        """Check if user can demote other users"""
        return self.is_authenticated and self.is_admin
    
    def can_ban_users(self):
        """Check if user can ban other users"""
        return self.is_authenticated and self.is_admin
    
    def can_view_user_details(self):
        """Check if user can view detailed user information"""
        return self.is_authenticated and (self.is_admin or self.is_volunteer)
    
    def can_manage_content(self):
        """Check if user can manage content"""
        return self.is_authenticated and (self.is_admin or self.is_volunteer)
    
    def can_view_reports(self):
        """Check if user can view reports"""
        return self.is_authenticated and (self.is_admin or self.is_volunteer)
    
    def can_handle_reports(self):
        """Check if user can handle reports"""
        return self.is_authenticated and self.is_admin
    
    def get_role_permissions(self):
        """Get all permissions for the user's role"""
        permissions = {
            'can_create_posts': self.can_create_posts(),
            'can_edit_posts': self.can_edit_posts(),
            'can_delete_posts': self.can_delete_posts(),
            'can_create_comments': self.can_create_comments(),
            'can_edit_comments': self.can_edit_comments(),
            'can_delete_comments': self.can_delete_comments(),
            'can_moderate_posts': self.can_moderate_posts(),
            'can_manage_users': self.can_manage_users(),
            'can_view_analytics': self.can_view_analytics(),
            'can_manage_roles': self.can_manage_roles(),
            'can_access_admin_panel': self.can_access_admin_panel(),
            'can_promote_users': self.can_promote_users(),
            'can_demote_users': self.can_demote_users(),
            'can_ban_users': self.can_ban_users(),
            'can_view_user_details': self.can_view_user_details(),
            'can_manage_content': self.can_manage_content(),
            'can_view_reports': self.can_view_reports(),
            'can_handle_reports': self.can_handle_reports(),
        }
        return permissions

class EmailVerificationToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verification_tokens')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"EmailVerificationToken({self.user.username}, {self.token})"

class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"PasswordResetToken({self.user.username}, {self.token})"
