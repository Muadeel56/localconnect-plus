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
