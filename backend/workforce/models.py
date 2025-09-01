from django.db import models
from django.conf import settings
from django.utils import timezone
from core.models import UUIDModel
from business.models import Business
import string
import random


def generate_staff_id():
    """Generate unique staff ID"""
    return f"EMP-{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"


class BusinessStaff(UUIDModel):
    """Staff members of a business"""
    EMPLOYMENT_TYPES = (
        ('FULL_TIME', 'Full Time'),
        ('PART_TIME', 'Part Time'),
        ('CONTRACT', 'Contract'),
        ('INTERN', 'Intern'),
    )

    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('TERMINATED', 'Terminated'),
        ('ON_LEAVE', 'On Leave'),
    )

    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name="staff_members"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='staff_positions'
    )
    name = models.CharField(max_length=255)
    staff_id = models.CharField(
        max_length=255,
        unique=True,
        default=generate_staff_id,
        help_text="Unique staff identifier"
    )
    job_title = models.CharField(max_length=255)
    department = models.CharField(max_length=255, blank=True)
    employment_type = models.CharField(max_length=15, choices=EMPLOYMENT_TYPES, default='FULL_TIME')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='ACTIVE')
    email = models.EmailField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    hire_date = models.DateField(default=timezone.now)
    termination_date = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = 'Business Staff'
        verbose_name_plural = 'Business Staff'
        indexes = [
            models.Index(fields=['business', 'status']),
            models.Index(fields=['staff_id']),
            models.Index(fields=['user']),
            models.Index(fields=['employment_type', 'status']),
        ]

    def __str__(self):
        return f"{self.name} - {self.business.name}"

    @property
    def is_active(self):
        return self.status == 'ACTIVE'


class Shift(UUIDModel):
    """Work shifts for business staff"""
    SHIFT_TYPES = (
        ('MORNING', 'Morning'),
        ('AFTERNOON', 'Afternoon'),
        ('EVENING', 'Evening'),
        ('NIGHT', 'Night'),
        ('FULL_DAY', 'Full Day'),
    )

    DAYS_OF_WEEK = (
        ('MONDAY', 'Monday'),
        ('TUESDAY', 'Tuesday'),
        ('WEDNESDAY', 'Wednesday'),
        ('THURSDAY', 'Thursday'),
        ('FRIDAY', 'Friday'),
        ('SATURDAY', 'Saturday'),
        ('SUNDAY', 'Sunday'),
    )

    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name="shifts"
    )
    staff = models.ForeignKey(
        BusinessStaff,
        on_delete=models.CASCADE,
        related_name="shifts"
    )
    name = models.CharField(max_length=100)
    shift_type = models.CharField(max_length=15, choices=SHIFT_TYPES, default='MORNING')
    day_of_week = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    break_duration = models.DurationField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Shift'
        verbose_name_plural = 'Shifts'
        unique_together = ('staff', 'day_of_week', 'start_time')
        indexes = [
            models.Index(fields=['business', 'is_active']),
            models.Index(fields=['staff', 'day_of_week']),
            models.Index(fields=['shift_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.staff.name} - {self.day_of_week} {self.shift_type}"


class HoursCard(UUIDModel):
    """Daily time tracking for staff"""
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('REVISED', 'Needs Revision'),
    )

    staff = models.ForeignKey(
        BusinessStaff,
        on_delete=models.CASCADE,
        related_name="hours_cards"
    )
    shift = models.ForeignKey(
        Shift,
        on_delete=models.CASCADE,
        related_name="hours_cards",
        null=True,
        blank=True
    )
    date = models.DateField()
    clock_in = models.TimeField()
    clock_out = models.TimeField()
    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)
    notes = models.TextField(max_length=500, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_hours'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(max_length=500, blank=True)

    class Meta:
        unique_together = ('staff', 'date')
        ordering = ['-date']
        verbose_name = 'Hours Card'
        verbose_name_plural = 'Hours Cards'
        indexes = [
            models.Index(fields=['staff', 'date']),
            models.Index(fields=['status', 'date']),
            models.Index(fields=['approved_by', 'approved_at']),
        ]

    def __str__(self):
        return f"{self.staff.name} - {self.date}"

    @property
    def total_hours(self):
        """Calculate total working hours"""
        from datetime import datetime, timedelta
        start = datetime.combine(self.date, self.clock_in)
        end = datetime.combine(self.date, self.clock_out)
        total = end - start

        # Subtract break time if recorded
        if self.break_start and self.break_end:
            break_start = datetime.combine(self.date, self.break_start)
            break_end = datetime.combine(self.date, self.break_end)
            break_duration = break_end - break_start
            total -= break_duration

        return total

    @property
    def is_approved(self):
        return self.status == 'APPROVED'

    @property
    def total_hours_decimal(self):
        """Return total hours as decimal for calculations"""
        return self.total_hours.total_seconds() / 3600
