from django.db import models
from django.conf import settings
from core.models import UUIDModel
import string
import random


def generate_business_id():
    """Generate unique business ID"""
    return f"BIZ-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"


class Business(UUIDModel):
    """Business information"""
    BUSINESS_CATEGORIES = (
        ('RESTAURANT', 'Restaurant'),
        ('RETAIL', 'Retail'),
        ('HEALTHCARE', 'Healthcare'),
        ('TECHNOLOGY', 'Technology'),
        ('CONSTRUCTION', 'Construction'),
        ('EDUCATION', 'Education'),
        ('MANUFACTURING', 'Manufacturing'),
        ('SERVICES', 'Services'),
        ('OTHER', 'Other'),
    )

    BUSINESS_SIZES = (
        ('SMALL', '1-10 employees'),
        ('MEDIUM', '11-50 employees'),
        ('LARGE', '51-200 employees'),
        ('ENTERPRISE', '200+ employees'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="businesses"
    )
    name = models.CharField(max_length=255)
    business_id = models.CharField(
        max_length=255,
        unique=True,
        default=generate_business_id,
        help_text="Unique business identifier"
    )
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    category = models.CharField(max_length=20, choices=BUSINESS_CATEGORIES)
    size = models.CharField(max_length=20, choices=BUSINESS_SIZES, default='SMALL')
    description = models.TextField(max_length=1000, blank=True)
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=20)
    website = models.URLField(blank=True)
    address = models.TextField(max_length=500)
    street = models.CharField(
    max_length=255,
    blank=True,
    help_text="Street name and number (e.g., Plot 45 John Babiha Avenue)"
)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True)
    service_time = models.TextField(max_length=500, blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    verification_token = models.CharField(max_length=255, blank=True)
    workplace_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Workplace latitude for clock-in geofencing"
    )
    workplace_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Workplace longitude for clock-in geofencing"
    )
    clock_in_radius_meters = models.IntegerField(
        default=100,
        help_text="Allowed radius in meters for clock-in (default 100m)"
    )
    require_location_for_clock_in = models.BooleanField(
        default=True,
        help_text="Require workers to be at workplace location to clock in"
    )

    class Meta:
        verbose_name = 'Business'
        verbose_name_plural = 'Businesses'
        indexes = [
            models.Index(fields=['category', 'is_verified']),
            models.Index(fields=['city', 'country']),
            models.Index(fields=['business_id']),
            models.Index(fields=['slug']),
            models.Index(fields=['user', 'is_active']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ContactUs(UUIDModel):
    """Contact form submissions"""
    INQUIRY_TYPES = (
        ('GENERAL', 'General Inquiry'),
        ('SUPPORT', 'Technical Support'),
        ('BUSINESS', 'Business Partnership'),
        ('BUG_REPORT', 'Bug Report'),
        ('FEATURE_REQUEST', 'Feature Request'),
    )

    email_address = models.EmailField(max_length=255)
    name = models.CharField(max_length=255)
    inquiry_type = models.CharField(max_length=20, choices=INQUIRY_TYPES, default='GENERAL')
    title = models.CharField(max_length=255)
    subject = models.TextField(max_length=2000)
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_contacts'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Us'
        verbose_name_plural = 'Contact Us'
        indexes = [
            models.Index(fields=['inquiry_type', 'is_resolved']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.name}"

