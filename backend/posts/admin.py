from django.contrib import admin
from .models import Post, Comment


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'status', 'location', 'created_at', 'comment_count']
    list_filter = ['category', 'status', 'created_at', 'author']
    search_fields = ['title', 'content', 'location', 'author__username']
    readonly_fields = ['created_at', 'updated_at', 'comment_count']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'content', 'category', 'location', 'status')
        }),
        ('Author Information', {
            'fields': ('author',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('System', {
            'fields': ('is_deleted',),
            'classes': ('collapse',)
        }),
    )
    
    def comment_count(self, obj):
        return obj.comment_count
    comment_count.short_description = 'Comments'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['content_preview', 'author', 'post', 'parent', 'depth', 'reply_count', 'created_at']
    list_filter = ['created_at', 'author', 'post__category']
    search_fields = ['content', 'author__username', 'post__title']
    readonly_fields = ['created_at', 'updated_at', 'depth', 'reply_count']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Content', {
            'fields': ('content', 'post', 'parent')
        }),
        ('Author Information', {
            'fields': ('author',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('System', {
            'fields': ('is_deleted',),
            'classes': ('collapse',)
        }),
    )
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
    
    def depth(self, obj):
        return obj.depth
    depth.short_description = 'Depth'
    
    def reply_count(self, obj):
        return obj.reply_count
    reply_count.short_description = 'Replies'
