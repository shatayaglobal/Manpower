from rest_framework import serializers
from django.conf import settings
from authentication.models import UserProfile
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
    user = serializers.SerializerMethodField()  # Add this for user details
    total_likes = serializers.SerializerMethodField()
    total_comments = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'user', 'user_name', 'title', 'post_type', 'location',
            'salary_range', 'description',  # Add these fields
            'total_likes', 'total_comments', 'created_at'
        ]

    def get_user(self, obj):
        """Return user details for job applications"""
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
        }

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
    cover_letter = serializers.CharField(required=False, allow_blank=True)
    resume = serializers.FileField(required=False, allow_null=True)
    additional_info = serializers.CharField(required=False, allow_blank=True)

    # Add these read-only fields
    applicant_name = serializers.CharField(source='applicant.full_name', read_only=True)
    resume_url = serializers.SerializerMethodField(read_only=True)
    status = serializers.CharField(read_only=True)  # if you don't want applicants changing it
    created_at = serializers.DateTimeField(read_only=True)
    reviewed_at = serializers.DateTimeField(read_only=True, allow_null=True)

    class Meta:
        model = JobApplication
        fields = [
            'id',
            'applicant_name',
            'cover_letter',
            'resume',
            'additional_info',
            'status',
            'created_at',
            'reviewed_at',
            'resume_url',
        ]
        read_only_fields = [
            'id',
            'applicant_name',
            'status',
            'created_at',
            'reviewed_at',
            'resume_url',
        ]

    def get_resume_url(self, obj):
        """Return full absolute URL for resume download"""
        if obj.resume:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.resume.url)
            # Fallback (e.g. in tests)
            return obj.resume.url
        return None

    def validate(self, attrs):
        request = self.context['request']

        # Set default cover letter if not provided
        if not attrs.get('cover_letter'):
            attrs['cover_letter'] = "Application submitted via profile"

        # Handle resume from profile if not uploaded
        if not attrs.get('resume'):
            try:
                user_profile = request.user.profile
                if user_profile.resume:
                    attrs['resume'] = user_profile.resume
                else:
                    raise serializers.ValidationError({
                        'resume': ['No resume found. Please upload a resume to your profile first.']
                    })
            except UserProfile.DoesNotExist:
                raise serializers.ValidationError({
                    'profile': ['Profile not found. Please create your profile first.']
                })

        return attrs


class JobApplicationListSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()
    job = PostListSerializer(read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'applicant', 'applicant_name', 'cover_letter', 'job',
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
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.resume.url)
            return obj.resume.url  
        return None


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['status']

    def validate_status(self, value):
        instance = self.instance
        if instance and instance.status in ['ACCEPTED', 'REJECTED']:
            raise serializers.ValidationError("Cannot change status of finalized applications")

        allowed_statuses = ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED']
        if value not in allowed_statuses:
            raise serializers.ValidationError(f"Status must be one of: {allowed_statuses}")
        return value
