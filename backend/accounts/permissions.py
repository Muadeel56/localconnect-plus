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

class CanCreatePosts(permissions.BasePermission):
    """
    Custom permission to check if user can create posts.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_create_posts()

class CanEditPosts(permissions.BasePermission):
    """
    Custom permission to check if user can edit posts.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_edit_posts()

class CanDeletePosts(permissions.BasePermission):
    """
    Custom permission to check if user can delete posts.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_delete_posts()

class CanCreateComments(permissions.BasePermission):
    """
    Custom permission to check if user can create comments.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_create_comments()

class CanEditComments(permissions.BasePermission):
    """
    Custom permission to check if user can edit comments.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_edit_comments()

class CanDeleteComments(permissions.BasePermission):
    """
    Custom permission to check if user can delete comments.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_delete_comments()

class CanViewAnalytics(permissions.BasePermission):
    """
    Custom permission to check if user can view analytics.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_view_analytics()

class CanManageRoles(permissions.BasePermission):
    """
    Custom permission to check if user can manage roles.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_manage_roles()

class CanAccessAdminPanel(permissions.BasePermission):
    """
    Custom permission to check if user can access admin panel.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_access_admin_panel()

class RoleBasedPermission(permissions.BasePermission):
    """
    Generic role-based permission that can be configured for different actions.
    """
    def __init__(self, allowed_roles=None, action_roles=None):
        self.allowed_roles = allowed_roles or []
        self.action_roles = action_roles or {}
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check action-specific roles
        action = getattr(view, 'action', None)
        if action and action in self.action_roles:
            return request.user.role in self.action_roles[action]
        
        # Check general allowed roles
        if self.allowed_roles:
            return request.user.role in self.allowed_roles
        
        return True 