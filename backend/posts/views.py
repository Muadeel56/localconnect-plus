from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Post, Comment
from .serializers import (
    PostSerializer, PostListSerializer, PostCreateSerializer,
    CommentSerializer, CommentCreateSerializer
)
from accounts.permissions import IsOwnerOrAdmin


class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Post model with CRUD operations and filtering
    """
    queryset = Post.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'author']
    search_fields = ['title', 'content', 'location']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return PostCreateSerializer
        elif self.action == 'list':
            return PostListSerializer
        return PostSerializer
    
    def get_queryset(self):
        """Filter queryset based on request parameters"""
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by location
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Filter by author
        author = self.request.query_params.get('author', None)
        if author:
            queryset = queryset.filter(author__username__icontains=author)
        
        return queryset
    
    def perform_create(self, serializer):
        """Set the author to the current user"""
        serializer.save(author=self.request.user)
    
    def perform_destroy(self, instance):
        """Soft delete the post"""
        instance.soft_delete()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def close(self, request, pk=None):
        """Close a post (change status to CLOSED)"""
        post = self.get_object()
        if post.author == request.user or request.user.is_admin:
            post.status = Post.Status.CLOSED
            post.save()
            serializer = self.get_serializer(post)
            return Response(serializer.data)
        return Response(
            {'error': 'You do not have permission to close this post'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reopen(self, request, pk=None):
        """Reopen a post (change status to OPEN)"""
        post = self.get_object()
        if post.author == request.user or request.user.is_admin:
            post.status = Post.Status.OPEN
            post.save()
            serializer = self.get_serializer(post)
            return Response(serializer.data)
        return Response(
            {'error': 'You do not have permission to reopen this post'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all available post categories"""
        categories = [{'value': choice[0], 'label': choice[1]} for choice in Post.Category.choices]
        return Response(categories)
    
    @action(detail=False, methods=['get'])
    def statuses(self, request):
        """Get all available post statuses"""
        statuses = [{'value': choice[0], 'label': choice[1]} for choice in Post.Status.choices]
        return Response(statuses)


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Comment model with CRUD operations and threading
    """
    queryset = Comment.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['post', 'author', 'parent']
    ordering_fields = ['created_at']
    ordering = ['created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_queryset(self):
        """Filter queryset based on request parameters"""
        queryset = super().get_queryset()
        
        # Filter by post
        post_id = self.request.query_params.get('post', None)
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        # Filter by parent (for threading)
        parent_id = self.request.query_params.get('parent', None)
        if parent_id:
            queryset = queryset.filter(parent_id=parent_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Set the author to the current user"""
        serializer.save(author=self.request.user)
    
    def perform_destroy(self, instance):
        """Soft delete the comment"""
        instance.soft_delete()
    
    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        """Get all replies to a specific comment"""
        comment = self.get_object()
        replies = comment.replies.filter(is_deleted=False)
        serializer = self.get_serializer(replies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_post(self, request):
        """Get all comments for a specific post with threading"""
        post_id = request.query_params.get('post_id')
        if not post_id:
            return Response(
                {'error': 'post_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get top-level comments for the post
        top_level_comments = Comment.objects.filter(
            post_id=post_id,
            parent=None,
            is_deleted=False
        ).order_by('created_at')
        
        serializer = self.get_serializer(top_level_comments, many=True)
        return Response(serializer.data)
