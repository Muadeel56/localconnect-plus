from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import authenticate
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db import models
from django.shortcuts import get_object_or_404
from .models import User, EmailVerificationToken, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer, UserProfileSerializer, UserUpdateSerializer,
    UserLoginSerializer, PasswordChangeSerializer, AdminUserSerializer
)
from .utils import generate_token, send_verification_email, send_password_reset_email
from .permissions import IsAdminUser, CanManageUsers, CanManageRoles

@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(generics.CreateAPIView):
    """
    View for user registration
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            # Generate and send email verification token
            token = generate_token()
            EmailVerificationToken.objects.create(user=user, token=token)
            send_verification_email(user, token)
            return Response({
                'message': 'User registered successfully. Please check your email to verify your account.',
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class UserLoginView(APIView):
    """
    View for user login with JWT tokens
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class UserLogoutView(APIView):
    """
    View for user logout (blacklist refresh token)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class TokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view
    """
    pass

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    View for user profile retrieval and update
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_context(self):
        """
        Add request to serializer context for proper URL generation
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class UserUpdateView(generics.UpdateAPIView):
    """
    View for updating user profile fields
    """
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def put(self, request, *args, **kwargs):
        """
        Handle PUT request for profile update with file upload support
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Return full user data using UserProfileSerializer
            from .serializers import UserProfileSerializer
            full_serializer = UserProfileSerializer(instance, context={'request': request})
            response_data = full_serializer.data
            print(f"Profile update response data: {response_data}")
            print(f"Profile picture URL: {response_data.get('profile_picture')}")
            return Response(response_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordChangeView(APIView):
    """
    View for password change
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminUserListView(generics.ListAPIView):
    """
    View for admin to list all users
    """
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        return queryset

class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """
    View for admin to view and update user details
    """
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """
    Get current user information
    """
    serializer = UserProfileSerializer(request.user, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    """
    Verify user email using token
    """
    token = request.data.get('token')
    if not token:
        return Response({'error': 'Token is required.'}, status=400)
    try:
        token_obj = EmailVerificationToken.objects.get(token=token, is_used=False)
        user = token_obj.user
        user.email_verified = True
        user.save()
        token_obj.is_used = True
        token_obj.save()
        return Response({'message': 'Email verified successfully.'})
    except EmailVerificationToken.DoesNotExist:
        return Response({'error': 'Invalid or expired token.'}, status=400)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def request_password_reset(request):
    """
    Request password reset: generate token, send email
    """
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required.'}, status=400)
    try:
        user = User.objects.get(email=email)
        # Generate and store token
        token = generate_token()
        PasswordResetToken.objects.create(user=user, token=token)
        send_password_reset_email(user, token)
        return Response({'message': 'Password reset email sent.'})
    except User.DoesNotExist:
        # For security, don't reveal if email exists
        return Response({'message': 'Password reset email sent.'})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """
    Reset password with token
    """
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    if not token or not new_password:
        return Response({'error': 'Token and new_password are required.'}, status=400)
    try:
        token_obj = PasswordResetToken.objects.get(token=token, is_used=False)
        user = token_obj.user
        user.set_password(new_password)
        user.save()
        token_obj.is_used = True
        token_obj.save()
        return Response({'message': 'Password reset successfully.'})
    except PasswordResetToken.DoesNotExist:
        return Response({'error': 'Invalid or expired token.'}, status=400)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_verification_token(request):
    """
    Get verification token for testing purposes (development only)
    """
    username = request.query_params.get('username')
    if not username:
        return Response({'error': 'Username parameter is required.'}, status=400)
    
    try:
        user = User.objects.get(username=username)
        token_obj = EmailVerificationToken.objects.filter(user=user, is_used=False).first()
        
        if token_obj:
            return Response({
                'username': username,
                'token': token_obj.token,
                'created_at': token_obj.created_at
            })
        else:
            return Response({'error': 'No unused verification token found for this user.'}, status=404)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_password_reset_token(request):
    """
    Get password reset token for testing purposes (development only)
    """
    username = request.query_params.get('username')
    if not username:
        return Response({'error': 'Username parameter is required.'}, status=400)
    
    try:
        user = User.objects.get(username=username)
        token_obj = PasswordResetToken.objects.filter(user=user, is_used=False).first()
        
        if token_obj:
            return Response({
                'username': username,
                'token': token_obj.token,
                'created_at': token_obj.created_at
            })
        else:
            return Response({'error': 'No unused password reset token found for this user.'}, status=404)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_permissions(request):
    """
    Get current user's permissions based on their role
    """
    if not request.user.is_authenticated:
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    permissions = request.user.get_role_permissions()
    return Response({
        'user_id': request.user.id,
        'username': request.user.username,
        'role': request.user.role,
        'permissions': permissions
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, CanManageRoles])
def change_user_role(request):
    """
    Change a user's role (Admin only)
    """
    try:
        user_id = request.data.get('user_id')
        new_role = request.data.get('new_role')
        
        if not user_id or not new_role:
            return Response({
                'error': 'user_id and new_role are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate role
        valid_roles = [choice[0] for choice in User.Role.choices]
        if new_role not in valid_roles:
            return Response({
                'error': f'Invalid role. Valid roles are: {", ".join(valid_roles)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user to change
        user_to_change = get_object_or_404(User, id=user_id)
        
        # Prevent self-role change
        if user_to_change == request.user:
            return Response({
                'error': 'Cannot change your own role'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent changing other admin roles
        if user_to_change.is_admin and not request.user.is_admin:
            return Response({
                'error': 'Only admins can change admin roles'
            }, status=status.HTTP_403_FORBIDDEN)
        
        old_role = user_to_change.role
        user_to_change.role = new_role
        user_to_change.save()
        
        return Response({
            'message': f'User {user_to_change.username} role changed from {old_role} to {new_role}',
            'user_id': user_to_change.id,
            'username': user_to_change.username,
            'old_role': old_role,
            'new_role': new_role
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, CanManageUsers])
def get_users_list(request):
    """
    Get list of users (Admin and Volunteers can view)
    """
    try:
        # Get query parameters
        role_filter = request.query_params.get('role', None)
        search_query = request.query_params.get('search', None)
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        
        # Start with all users
        users = User.objects.all()
        
        # Apply role filter
        if role_filter:
            users = users.filter(role=role_filter)
        
        # Apply search filter
        if search_query:
            users = users.filter(
                models.Q(username__icontains=search_query) |
                models.Q(email__icontains=search_query) |
                models.Q(first_name__icontains=search_query) |
                models.Q(last_name__icontains=search_query)
            )
        
        # Calculate pagination
        total_count = users.count()
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        
        # Get paginated results
        users_page = users[start_index:end_index]
        
        # Serialize users (exclude sensitive info for non-admins)
        if request.user.is_admin:
            user_data = UserSerializer(users_page, many=True).data
        else:
            # For volunteers, show limited info
            user_data = []
            for user in users_page:
                user_data.append({
                    'id': user.id,
                    'username': user.username,
                    'role': user.role,
                    'email_verified': user.email_verified,
                    'created_at': user.created_at,
                    'is_active': user.is_active
                })
        
        return Response({
            'users': user_data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': (total_count + page_size - 1) // page_size
            }
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, CanManageUsers])
def toggle_user_status(request):
    """
    Toggle user active status (Admin only)
    """
    try:
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({
                'error': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user to toggle
        user_to_toggle = get_object_or_404(User, id=user_id)
        
        # Prevent self-deactivation
        if user_to_toggle == request.user:
            return Response({
                'error': 'Cannot deactivate your own account'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Toggle status
        user_to_toggle.is_active = not user_to_toggle.is_active
        user_to_toggle.save()
        
        status_text = 'activated' if user_to_toggle.is_active else 'deactivated'
        
        return Response({
            'message': f'User {user_to_toggle.username} has been {status_text}',
            'user_id': user_to_toggle.id,
            'username': user_to_toggle.username,
            'is_active': user_to_toggle.is_active
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
