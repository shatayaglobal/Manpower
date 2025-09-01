from django.db import models
from django.contrib.auth import models as auth_models
from django.utils import timezone
from core.models import UUIDModel, TimeStampedModel
from .managers import CustomUserManager  # Import your custom manager
import os
from uuid import uuid4


def avatar_upload_path(instance, filename):
    """Generate upload path for avatar files"""
    ext = filename.split('.')[-1]
    filename = f"avatars/{uuid4()}.{ext}"
    return filename


class User(auth_models.AbstractUser):
    """Custom User model with UUID and Google OAuth support"""
    ACCOUNT_TYPES = (
        ('WORKER', 'Worker'),
        ('BUSINESS', 'Business'),
    )

    # Use UUID as primary key
    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False
    )

    first_name = models.CharField(verbose_name="first name", max_length=255)
    last_name = models.CharField(verbose_name="last name", max_length=255)
    email = models.EmailField(verbose_name="email", max_length=255, unique=True)
    password = models.CharField(max_length=255)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPES, default='WORKER')
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    is_google_user = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Remove username field
    username = None
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    # Add the custom manager
    objects = CustomUserManager()

    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['account_type']),
            models.Index(fields=['google_id']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class UserProfile(UUIDModel):
    """Extended user profile information"""
    user = models.OneToOneField(
        User,
        related_name="profile",
        on_delete=models.CASCADE
    )
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    profession = models.CharField(max_length=255, blank=True)
    avatar = models.ImageField(upload_to=avatar_upload_path, blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['profession']),
        ]

    def __str__(self):
        return f"{self.user.email} - Profile"
