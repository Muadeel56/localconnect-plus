from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count as models_Count
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta

from .models import Post, Comment
from .serializers import (
    PostSerializer, PostListSerializer, PostCreateSerializer,
    CommentSerializer, CommentCreateSerializer
)
from accounts.permissions import IsOwnerOrAdmin, CanCreatePosts, CanEditPosts, CanDeletePosts, CanCreateComments, CanEditComments, CanDeleteComments


class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Post model with CRUD operations and advanced filtering
    """
    queryset = Post.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'author']
    search_fields = ['title', 'content', 'location', 'author__username']
    ordering_fields = ['created_at', 'updated_at', 'title', 'comment_count']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permission_classes = [CanCreatePosts]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [CanEditPosts, IsOwnerOrAdmin]
        elif self.action == 'destroy':
            permission_classes = [CanDeletePosts, IsOwnerOrAdmin]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return PostCreateSerializer
        elif self.action == 'list':
            return PostListSerializer
        return PostSerializer
    
    def get_queryset(self):
        """Enhanced filtering with advanced search capabilities"""
        queryset = super().get_queryset()
        
        # Basic filters
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        author = self.request.query_params.get('author', None)
        if author:
            queryset = queryset.filter(author__username__icontains=author)
        
        # Advanced search
        search_query = self.request.query_params.get('search', None)
        if search_query:
            search_terms = search_query.split()
            search_q = Q()
            for term in search_terms:
                search_q |= (
                    Q(title__icontains=term) |
                    Q(content__icontains=term) |
                    Q(location__icontains=term) |
                    Q(author__username__icontains=term) |
                    Q(category__icontains=term)
                )
            queryset = queryset.filter(search_q)
        
        # Date range filtering
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, '%Y-%m-%d')
                queryset = queryset.filter(created_at__gte=date_from_obj)
            except ValueError:
                pass
        
        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, '%Y-%m-%d') + timedelta(days=1)
                queryset = queryset.filter(created_at__lt=date_to_obj)
            except ValueError:
                pass
        
        # Time-based filtering
        time_filter = self.request.query_params.get('time_filter', None)
        if time_filter:
            now = datetime.now()
            if time_filter == 'today':
                queryset = queryset.filter(created_at__date=now.date())
            elif time_filter == 'week':
                week_ago = now - timedelta(days=7)
                queryset = queryset.filter(created_at__gte=week_ago)
            elif time_filter == 'month':
                month_ago = now - timedelta(days=30)
                queryset = queryset.filter(created_at__gte=month_ago)
        
        # Popularity filtering (by comment count)
        min_comments = self.request.query_params.get('min_comments', None)
        if min_comments:
            try:
                min_comments_int = int(min_comments)
                queryset = queryset.annotate(
                    comment_count=models_Count('comments', filter=Q(comments__is_deleted=False))
                ).filter(comment_count__gte=min_comments_int)
            except ValueError:
                pass
        
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
    
    @action(detail=False, methods=['get'])
    def search_suggestions(self, request):
        """Get search suggestions based on existing posts"""
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response([])
        
        # Get suggestions from titles, categories, and locations
        suggestions = []
        
        # Title suggestions
        title_suggestions = Post.objects.filter(
            title__icontains=query,
            is_deleted=False
        ).values_list('title', flat=True)[:5]
        suggestions.extend(title_suggestions)
        
        # Category suggestions
        category_suggestions = Post.objects.filter(
            category__icontains=query,
            is_deleted=False
        ).values_list('category', flat=True).distinct()[:3]
        suggestions.extend(category_suggestions)
        
        # Location suggestions
        location_suggestions = Post.objects.filter(
            location__icontains=query,
            is_deleted=False
        ).values_list('location', flat=True).distinct()[:3]
        suggestions.extend(location_suggestions)
        
        return Response(list(set(suggestions))[:10])
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get post statistics for analytics"""
        total_posts = Post.objects.filter(is_deleted=False).count()
        open_posts = Post.objects.filter(status=Post.Status.OPEN, is_deleted=False).count()
        closed_posts = Post.objects.filter(status=Post.Status.CLOSED, is_deleted=False).count()
        
        # Category distribution
        category_stats = Post.objects.filter(is_deleted=False).values('category').annotate(
            count=models_Count('id')
        )
        
        # Recent activity (posts created in last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_posts = Post.objects.filter(
            created_at__gte=week_ago,
            is_deleted=False
        ).count()
        
        return Response({
            'total_posts': total_posts,
            'open_posts': open_posts,
            'closed_posts': closed_posts,
            'recent_posts': recent_posts,
            'category_distribution': list(category_stats)
        })


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
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permission_classes = [CanCreateComments]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [CanEditComments, IsOwnerOrAdmin]
        elif self.action == 'destroy':
            permission_classes = [CanDeleteComments, IsOwnerOrAdmin]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]
        return [permission() for permission in permission_classes]
    
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
        
        # Validate that post_id is a valid integer
        try:
            post_id_int = int(post_id)
        except (ValueError, TypeError):
            return Response(
                {'error': 'post_id must be a valid integer'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the post exists
        try:
            from .models import Post
            post = Post.objects.get(id=post_id_int, is_deleted=False)
        except Post.DoesNotExist:
            return Response(
                {'error': 'Post not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get top-level comments for the post
        top_level_comments = Comment.objects.filter(
            post_id=post_id_int,
            parent=None,
            is_deleted=False
        ).order_by('created_at')
        
        serializer = self.get_serializer(top_level_comments, many=True)
        return Response(serializer.data)
