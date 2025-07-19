from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post, Comment

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user information in posts and comments"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role', 'location']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments with nested replies"""
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    reply_count = serializers.ReadOnlyField()
    depth = serializers.ReadOnlyField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'author', 'post', 'parent',
            'created_at', 'updated_at', 'replies', 'reply_count',
            'depth', 'can_edit', 'can_delete'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at', 'replies', 'reply_count', 'depth']
    
    def get_replies(self, obj):
        """Get nested replies for this comment"""
        if obj.replies.exists():
            return CommentSerializer(obj.replies.filter(is_deleted=False), many=True, context=self.context).data
        return []
    
    def get_can_edit(self, obj):
        """Check if current user can edit this comment"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_be_edited_by(request.user)
        return False
    
    def get_can_delete(self, obj):
        """Check if current user can delete this comment"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_be_deleted_by(request.user)
        return False
    
    def create(self, validated_data):
        """Create a new comment with the current user as author"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['author'] = request.user
        return super().create(validated_data)


class PostSerializer(serializers.ModelSerializer):
    """Serializer for posts with nested comments"""
    author = UserSerializer(read_only=True)
    comments = serializers.SerializerMethodField()
    comment_count = serializers.ReadOnlyField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'category', 'location', 'status',
            'author', 'created_at', 'updated_at', 'comments', 'comment_count',
            'can_edit', 'can_delete'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at', 'comments', 'comment_count']
    
    def get_comments(self, obj):
        """Get top-level comments for this post"""
        top_level_comments = obj.comments.filter(is_deleted=False, parent=None)
        return CommentSerializer(top_level_comments, many=True, context=self.context).data
    
    def get_can_edit(self, obj):
        """Check if current user can edit this post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_be_edited_by(request.user)
        return False
    
    def get_can_delete(self, obj):
        """Check if current user can delete this post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_be_deleted_by(request.user)
        return False
    
    def create(self, validated_data):
        """Create a new post with the current user as author"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['author'] = request.user
        return super().create(validated_data)


class PostListSerializer(serializers.ModelSerializer):
    """Simplified serializer for post listings"""
    author = UserSerializer(read_only=True)
    comment_count = serializers.ReadOnlyField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'category', 'location', 'status',
            'author', 'created_at', 'comment_count', 'can_edit', 'can_delete'
        ]
        read_only_fields = ['author', 'created_at', 'comment_count']
    
    def get_can_edit(self, obj):
        """Check if current user can edit this post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_be_edited_by(request.user)
        return False
    
    def get_can_delete(self, obj):
        """Check if current user can delete this post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_be_deleted_by(request.user)
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new posts"""
    class Meta:
        model = Post
        fields = ['title', 'content', 'category', 'location']
    
    def create(self, validated_data):
        """Create a new post with the current user as author"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['author'] = request.user
        return super().create(validated_data)


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new comments"""
    class Meta:
        model = Comment
        fields = ['content', 'post', 'parent']
    
    def create(self, validated_data):
        """Create a new comment with the current user as author"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['author'] = request.user
        return super().create(validated_data) 