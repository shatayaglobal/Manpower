# models.py
from django.db import models
from django.contrib.auth import models as auth_models
from django.utils import timezone
from core.models import UUIDModel, TimeStampedModel
from .managers import CustomUserManager
import os
from uuid import uuid4

def avatar_upload_path(instance, filename):
    """Generate upload path for avatar files"""
    ext = filename.split('.')[-1]
    filename = f"avatars/{uuid4()}.{ext}"
    return filename

def resume_upload_path(instance, filename):
    """Generate upload path for resume files"""
    ext = filename.split('.')[-1]
    filename = f"resumes/{uuid4()}.{ext}"
    return filename

def portfolio_upload_path(instance, filename):
    """Generate upload path for portfolio files"""
    ext = filename.split('.')[-1]
    filename = f"portfolios/{uuid4()}.{ext}"
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

    @property
    def has_complete_profile(self):
        """Check if user has a complete profile"""
        if self.account_type != 'WORKER':
            return True

        try:
            profile = self.profile
            return profile.is_complete
        except UserProfile.DoesNotExist:
            return False

class UserProfile(UUIDModel):
    """Extended user profile information"""

    MARITAL_STATUS_CHOICES = (
        ('SINGLE', 'Single'),
        ('MARRIED', 'Married'),
        ('DIVORCED', 'Divorced'),
        ('WIDOWED', 'Widowed'),
        ('PREFER_NOT_TO_SAY', 'Prefer not to say'),
    )

    GENDER_CHOICES = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
        ('PREFER_NOT_TO_SAY', 'Prefer not to say'),
    )

    EMPLOYMENT_STATUS_CHOICES = (
        ('EMPLOYED', 'Currently Employed'),
        ('UNEMPLOYED', 'Unemployed'),
        ('STUDENT', 'Student'),
        ('FREELANCER', 'Freelancer'),
        ('SELF_EMPLOYED', 'Self Employed'),
        ('RETIRED', 'Retired'),
    )

    EXPERIENCE_LEVEL_CHOICES = (
        ('ENTRY', 'Entry Level (0-2 years)'),
        ('JUNIOR', 'Junior (2-5 years)'),
        ('MID', 'Mid Level (5-8 years)'),
        ('SENIOR', 'Senior (8-12 years)'),
        ('LEAD', 'Lead/Principal (12+ years)'),
        ('EXECUTIVE', 'Executive/Director'),
    )

    user = models.OneToOneField(
        User,
        related_name="profile",
        on_delete=models.CASCADE
    )

    # Personal Information
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    alternate_phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, blank=True)
    nationality = models.CharField(max_length=100, blank=True)

    # Professional Information
    profession = models.CharField(max_length=255, blank=True)
    current_job_title = models.CharField(max_length=255, blank=True)
    current_company = models.CharField(max_length=255, blank=True)
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS_CHOICES, blank=True)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES, blank=True)
    years_of_experience = models.PositiveIntegerField(blank=True, null=True)

    # Bio and Description
    bio = models.TextField(max_length=1000, blank=True, help_text="Professional summary")
    objective = models.TextField(max_length=500, blank=True, help_text="Career objective")

    # Skills and Expertise
    skills = models.JSONField(default=list, blank=True, help_text="List of technical skills")
    languages = models.JSONField(default=list, blank=True, help_text="Spoken languages with proficiency")
    certifications = models.JSONField(default=list, blank=True, help_text="Professional certifications")

    # Work Experience (detailed)
    work_experience = models.JSONField(default=list, blank=True, help_text="Detailed work history")

    # Education
    education = models.JSONField(default=list, blank=True, help_text="Educational background")

    # Additional Information
    hobbies = models.TextField(max_length=500, blank=True)
    achievements = models.TextField(max_length=1000, blank=True)
    references = models.JSONField(default=list, blank=True)

    # Salary and Availability
    expected_salary_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    expected_salary_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    salary_currency = models.CharField(max_length=3, default='USD', blank=True)
    available_for_work = models.BooleanField(default=True)
    availability_date = models.DateField(blank=True, null=True)
    willing_to_relocate = models.BooleanField(default=False)
    travel_willingness = models.BooleanField(default=False)

    # Files and Media
    avatar = models.ImageField(upload_to=avatar_upload_path, blank=True, null=True)
    resume = models.FileField(upload_to=resume_upload_path, blank=True, null=True)
    portfolio = models.FileField(upload_to=portfolio_upload_path, blank=True, null=True)

    # Social and Professional Links
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)

    # Privacy and Preferences
    profile_visibility = models.BooleanField(default=True, help_text="Make profile visible to employers")
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)

    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    emergency_contact_relationship = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['profession']),
            models.Index(fields=['city', 'country']),
            models.Index(fields=['employment_status']),
            models.Index(fields=['experience_level']),
        ]

    def __str__(self):
        return f"{self.user.email} - Profile"

    @property
    def is_complete(self):
        """Check if the profile has all required fields completed"""
        required_fields = [
            'phone',
            'bio',
            'city',
            'country',
            'profession',
            'employment_status',
            'experience_level',
        ]

        # Check if user has required personal info
        if not all([self.user.first_name, self.user.last_name]):
            return False

        # Check profile required fields
        for field in required_fields:
            if not getattr(self, field, None):
                return False

        # Check if skills list is not empty
        if not self.skills:
            return False

        # Check if work experience has at least one entry
        if not self.work_experience:
            return False

        return True

    @property
    def completion_percentage(self):
        """Calculate profile completion percentage"""
        total_fields = 20  # Adjust based on what you consider important
        completed_fields = 0

        # Basic info
        if self.user.first_name: completed_fields += 1
        if self.user.last_name: completed_fields += 1
        if self.phone: completed_fields += 1
        if self.bio: completed_fields += 1
        if self.city: completed_fields += 1
        if self.country: completed_fields += 1
        if self.profession: completed_fields += 1
        if self.employment_status: completed_fields += 1
        if self.experience_level: completed_fields += 1
        if self.skills: completed_fields += 1
        if self.work_experience: completed_fields += 1
        if self.education: completed_fields += 1
        if self.avatar: completed_fields += 1
        if self.resume: completed_fields += 1
        if self.date_of_birth: completed_fields += 1
        if self.linkedin_url: completed_fields += 1
        if self.expected_salary_min: completed_fields += 1
        if self.languages: completed_fields += 1
        if self.certifications: completed_fields += 1
        if self.objective: completed_fields += 1

        return (completed_fields / total_fields) * 100

    @property
    def missing_required_fields(self):
        """Get list of missing required fields"""
        missing = []

        if not self.user.first_name:
            missing.append('first_name')
        if not self.user.last_name:
            missing.append('last_name')
        if not self.phone:
            missing.append('phone')
        if not self.bio:
            missing.append('bio')
        if not self.city:
            missing.append('city')
        if not self.country:
            missing.append('country')
        if not self.profession:
            missing.append('profession')
        if not self.employment_status:
            missing.append('employment_status')
        if not self.experience_level:
            missing.append('experience_level')
        if not self.skills:
            missing.append('skills')
        if not self.work_experience:
            missing.append('work_experience')

        return missing

    @property
    def is_application_ready(self):
        """Check if profile has minimum info needed for job applications"""
        # Basic required fields for applying to jobs
        basic_required = [
            'phone',
            'profession',
            'city',
            'bio'
        ]

        # Check if user has required personal info
        if not all([self.user.first_name, self.user.last_name]):
            return False

        # Check basic required fields
        for field in basic_required:
            if not getattr(self, field, None):
                return False

        # Check if skills list is not empty
        if not self.skills:
            return False

        # Check if resume/CV is uploaded
        if not self.resume:
            return False

        return True

    @property
    def missing_application_fields(self):
        """Get missing fields needed for job applications"""
        missing = []

        if not self.user.first_name:
            missing.append('first_name')
        if not self.user.last_name:
            missing.append('last_name')
        if not self.phone:
            missing.append('phone')
        if not self.profession:
            missing.append('profession')
        if not self.city:
            missing.append('city')
        if not self.bio:
            missing.append('bio')
        if not self.skills:
            missing.append('skills')
        if not self.resume:
            missing.append('resume')

        return missing
