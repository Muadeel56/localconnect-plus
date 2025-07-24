from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', views.TokenRefreshView.as_view(), name='token-refresh'),
    path('current-user/', views.current_user, name='current_user'),
    
    # Profile management
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.UserUpdateView.as_view(), name='profile-update'),
    
    # Password management
    path('change-password/', views.PasswordChangeView.as_view(), name='change-password'),
    path('request-password-reset/', views.request_password_reset, name='request-password-reset'),
    path('reset-password/', views.reset_password, name='reset-password'),
    
    # Email verification
    path('verify-email/', views.verify_email, name='verify-email'),
    
    # Role management and permissions
    path('permissions/', views.get_user_permissions, name='get_user_permissions'),
    path('change-role/', views.change_user_role, name='change_user_role'),
    path('users/', views.get_users_list, name='get_users_list'),
    path('toggle-user-status/', views.toggle_user_status, name='toggle_user_status'),
    
    # Admin endpoints
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    
    # Development endpoints (remove in production)
    path('get-verification-token/', views.get_verification_token, name='get-verification-token'),
    path('get-password-reset-token/', views.get_password_reset_token, name='get-password-reset-token'),
] 