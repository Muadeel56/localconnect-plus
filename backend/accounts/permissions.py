from rest_framework import permissions
from .models import User

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin

class IsVolunteerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow volunteers and admins.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_admin or request.user.is_volunteer
        )

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins.
    """
    def has_object_permission(self, request, view, obj):
        # Admin can access any object
        if request.user.is_admin:
            return True
        
        # Check if the object has a user field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'author'):
            return obj.author == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        # If object is the user itself
        if isinstance(obj, User):
            return obj == request.user
        
        return False

class CanModeratePosts(permissions.BasePermission):
    """
    Custom permission to check if user can moderate posts.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_moderate_posts()

class CanManageUsers(permissions.BasePermission):
    """
    Custom permission to check if user can manage other users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_manage_users()

class IsVerifiedUser(permissions.BasePermission):
    """
    Custom permission to only allow verified users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.email_verified 