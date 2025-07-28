from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'bio', 'location', 'phone'
        )
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Password fields didn't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile updates
    """
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'bio', 'location', 'phone', 'role', 'email_verified',
            'profile_picture', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'username', 'email', 'role', 'email_verified', 'created_at', 'updated_at')
    
    def to_representation(self, instance):
        """
        Custom representation to ensure profile_picture URL is properly formatted
        """
        data = super().to_representation(instance)
        if instance.profile_picture:
            # Ensure the URL is absolute
            request = self.context.get('request')
            if request:
                data['profile_picture'] = request.build_absolute_uri(instance.profile_picture.url)
            else:
                data['profile_picture'] = instance.profile_picture.url
        return data

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile updates (allows some fields to be updated)
    """
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'bio', 'location', 'phone', 'profile_picture')
    
    def to_representation(self, instance):
        """
        Custom representation to ensure profile_picture URL is properly formatted
        """
        data = super().to_representation(instance)
        if instance.profile_picture:
            # Ensure the URL is absolute
            request = self.context.get('request')
            if request:
                data['profile_picture'] = request.build_absolute_uri(instance.profile_picture.url)
            else:
                data['profile_picture'] = instance.profile_picture.url
        return data
    
    def validate_phone(self, value):
        if value and not value.startswith('+'):
            raise serializers.ValidationError("Phone number must start with '+'")
        return value
    
    def validate_profile_picture(self, value):
        if value:
            # Check file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Profile picture must be less than 5MB")
            
            # Check file type by extension and content type
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
            allowed_content_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
            
            # Check by file extension
            file_extension = value.name.lower()
            print(f"Validating file: {value.name}, extension: {file_extension}")
            
            if not any(file_extension.endswith(ext) for ext in allowed_extensions):
                print(f"File extension {file_extension} not in allowed extensions: {allowed_extensions}")
                raise serializers.ValidationError("Profile picture must be a valid image file (JPEG, PNG, GIF, WebP, or BMP)")
            
            # Check by content type if available
            if hasattr(value, 'content_type') and value.content_type:
                print(f"Content type: {value.content_type}")
                if value.content_type not in allowed_content_types:
                    print(f"Content type {value.content_type} not in allowed types: {allowed_content_types}")
                    raise serializers.ValidationError("Profile picture must be a valid image file (JPEG, PNG, GIF, WebP, or BMP)")
            
            print(f"File validation passed for: {value.name}")
        
        return value

class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=128, write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            if not user.email_verified:
                raise serializers.ValidationError('Please verify your email address before logging in. Check your email for a verification link.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include "username" and "password".')

class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError("New password fields didn't match.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value

class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer for admin user management
    """
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_active', 'email_verified', 'created_at'
        )
        read_only_fields = ('id', 'created_at') 