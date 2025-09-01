from django.contrib import admin
from .models import Post, Like, Poke, Comment, JobApplication


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'post_type', 'priority', 'is_active', 'view_count', 'created_at','expires_at',
        'created_by',
        'updated_by']
    list_filter = ['post_type', 'priority', 'is_active',   'created_at',
        'created_by',
        'updated_by']
    search_fields = ['title', 'description', 'user__email']
    readonly_fields = ['view_count', 'created_at',   'created_at',
        'created_by',
        'updated_by']
    ordering = ['-created_at']

    def save_model(self, request, obj, form, change):
        """Override save to set created_by and updated_by"""
        if not obj.pk:
            obj.created_by = request.user
            if not obj.user:
                obj.user = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'comment', 'parent', 'created_at']
    list_filter = ['created_at', 'is_edited']
    search_fields = ['comment', 'user__email', 'post__title']
    ordering = ['-created_at']


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'like', 'created_at']
    list_filter = ['like', 'created_at']


@admin.register(Poke)
class PokeAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'poke', 'created_at']
    list_filter = ['poke', 'created_at']


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['job', 'applicant', 'cover_letter', 'resume', 'additional_info', 'status', 'reviewed_by', 'reviewed_at']

