from django.db import models

from django.db import models
from django.conf import settings
from core.models import UUIDModel
import os
from uuid import uuid4


def post_image_upload_path(instance, filename):
    """Generate upload path for post images"""
    ext = filename.split('.')[-1]
    filename = f"posts/{uuid4()}.{ext}"
    return filename


class Post(UUIDModel):
    """Job posts or general posts"""
    POST_TYPES = (
        ('JOB', 'Job Posting'),
        ('GENERAL', 'General Post'),
        ('ANNOUNCEMENT', 'Announcement'),
    )

    PRIORITY_LEVELS = (
        ('LOW', 'Low Priority'),
        ('MEDIUM', 'Medium Priority'),
        ('HIGH', 'High Priority'),
        ('URGENT', 'Urgent'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    title = models.CharField(max_length=250)
    description = models.TextField(max_length=1000)
    post_type = models.CharField(max_length=20, choices=POST_TYPES, default='GENERAL')
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='MEDIUM')
    location = models.CharField(max_length=550, blank=True)
    image = models.ImageField(upload_to=post_image_upload_path, blank=True, null=True)
    salary_range = models.CharField(max_length=100, blank=True)  # For job posts
    requirements = models.TextField(max_length=500, blank=True)  # For job posts
    expires_at = models.DateTimeField(null=True, blank=True)  # For job posts
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_posts'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_posts'
    )



    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
        indexes = [
            models.Index(fields=['post_type', 'is_active']),
            models.Index(fields=['created_at']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['priority', 'expires_at']),
        ]

    def __str__(self):
        return self.title

    @property
    def total_likes(self):
        return self.likes.filter(like=True).count()

    @property
    def total_pokes(self):
        return self.pokes.filter(poke=True).count()

    @property
    def total_comments(self):
        return self.comments.count()

    @property
    def is_expired(self):
        if self.expires_at:
            from django.utils import timezone
            return timezone.now() > self.expires_at
        return False

    @property
    def total_applications(self):
        return self.applications.count()


class Like(UUIDModel):
    """User likes on posts"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_likes'
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    like = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'post')
        verbose_name = 'Like'
        verbose_name_plural = 'Likes'
        indexes = [
            models.Index(fields=['user', 'post']),
            models.Index(fields=['post', 'like']),
        ]

    def __str__(self):
        return f"{self.user} {'likes' if self.like else 'unlikes'} {self.post}"


class Poke(UUIDModel):
    """User pokes on posts (interest/bookmark)"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_pokes'
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='pokes')
    poke = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'post')
        verbose_name = 'Poke'
        verbose_name_plural = 'Pokes'
        indexes = [
            models.Index(fields=['user', 'post']),
            models.Index(fields=['post', 'poke']),
        ]

    def __str__(self):
        return f"{self.user} {'pokes' if self.poke else 'unpokes'} {self.post}"


class Comment(UUIDModel):
    """Comments on posts"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_comments'
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    comment = models.TextField(max_length=500)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    is_edited = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'
        indexes = [
            models.Index(fields=['post', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['parent']),
        ]

    def __str__(self):
        return f"Comment by {self.user.email} on {self.post.title}"


class JobApplication(UUIDModel):
    job = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_applications')
    cover_letter = models.TextField(max_length=2000)
    resume = models.FileField(upload_to='resumes/')
    additional_info = models.TextField(max_length=500, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending Review'),
        ('REVIEWED', 'Reviewed'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected')
    ], default='PENDING')

    # Audit fields
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('job', 'applicant')  # Prevent duplicate applications
        ordering = ['-created_at']
