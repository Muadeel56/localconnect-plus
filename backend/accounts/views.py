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
from .models import User, EmailVerificationToken, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer, UserProfileSerializer, UserUpdateSerializer,
    UserLoginSerializer, PasswordChangeSerializer, AdminUserSerializer
)
from .utils import generate_token, send_verification_email, send_password_reset_email

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
                'user': UserProfileSerializer(user).data,
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
                'user': UserProfileSerializer(user).data,
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

class UserUpdateView(generics.UpdateAPIView):
    """
    View for updating user profile fields
    """
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

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
    serializer = UserProfileSerializer(request.user)
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
