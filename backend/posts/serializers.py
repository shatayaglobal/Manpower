from rest_framework import serializers
from django.conf import settings
from .models import JobApplication, Post, Like, Poke, Comment
from drf_spectacular.utils import extend_schema_field


class PostSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    total_likes = serializers.SerializerMethodField()
    total_pokes = serializers.SerializerMethodField()
    total_comments = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()
    user_poked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'user', 'user_name', 'title', 'description', 'post_type',
            'priority', 'location', 'image', 'salary_range', 'requirements',
            'expires_at', 'total_likes', 'total_pokes', 'total_comments',
            'user_liked', 'user_poked', 'is_active', 'view_count', 'created_at', 'updated_at',
            'created_by', 'updated_by', 'total_applications'
        ]
        read_only_fields = ['id', 'user', 'view_count', 'created_at', 'updated_at', 'created_by', 'updated_by']

    @extend_schema_field(serializers.BooleanField)
    def get_user_liked(self, obj) -> bool:
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user, like=True).exists()
        return False

    @extend_schema_field(serializers.BooleanField)
    def get_user_poked(self, obj) -> bool:
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.pokes.filter(user=request.user, poke=True).exists()
        return False


    @extend_schema_field(serializers.IntegerField)
    def get_total_likes(self, obj) -> int:
        return obj.total_likes

    @extend_schema_field(serializers.IntegerField)
    def get_total_pokes(self, obj) -> int:
        return obj.total_pokes

    @extend_schema_field(serializers.IntegerField)
    def get_total_comments(self, obj) -> int:
        return obj.total_comments


class PostListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    total_likes = serializers.SerializerMethodField()
    total_comments = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'user_name', 'title', 'post_type', 'location',
            'total_likes', 'total_comments', 'created_at'
        ]

    @extend_schema_field(serializers.IntegerField)
    def get_total_likes(self, obj) -> int:
        return obj.total_likes

    @extend_schema_field(serializers.IntegerField)
    def get_total_comments(self, obj) -> int:
        return obj.total_comments


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'user', 'user_name', 'post', 'comment', 'parent',
            'replies_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    @extend_schema_field(serializers.IntegerField)
    def get_replies_count(self, obj) -> int:
        return obj.replies.count()

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'like']
        read_only_fields = ['user', 'post']

class PokeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poke
        fields = ['id', 'user', 'post', 'poke']
        read_only_fields = ['user', 'post']


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['cover_letter', 'resume', 'additional_info']


class JobApplicationListSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            'id', 'applicant', 'applicant_name', 'cover_letter',
            'resume', 'resume_url', 'additional_info', 'status',
            'created_at', 'updated_at', 'reviewed_at'
        ]

    def get_applicant_name(self, obj):
        user = obj.applicant
        if user.first_name and user.last_name:
            return f"{user.first_name} {user.last_name}"
        return user.email

    def get_resume_url(self, obj):
        if obj.resume:
            return obj.resume.url
        return None
