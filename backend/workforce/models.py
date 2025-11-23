from django.db import models
from django.conf import settings
from django.utils import timezone
from core.models import UUIDModel
from business.models import Business
import string
import random
import uuid
from django.conf import settings

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
    is_confirmed = models.BooleanField(default=True)
    job_title = models.CharField(max_length=255)
    department = models.CharField(max_length=255, blank=True)
    employment_type = models.CharField(max_length=15, choices=EMPLOYMENT_TYPES, default='FULL_TIME')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='ACTIVE')
    email = models.EmailField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    hire_date = models.DateField(default=timezone.now)
    termination_date = models.DateField(null=True, blank=True)
    clock_in_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Worker's latitude when clocking in"
    )
    clock_in_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Worker's longitude when clocking in"
    )
    clock_in_distance_meters = models.FloatField(
        null=True,
        blank=True,
        help_text="Distance from workplace when clocking in"
    )

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
        ('SIGNED', 'Signed by Worker'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
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

    # OLD TIME FIELDS - Keep for backward compatibility
    clock_in = models.TimeField(null=True, blank=True)
    clock_out = models.TimeField(null=True, blank=True)

    # NEW DATETIME FIELDS
    clock_in_datetime = models.DateTimeField(null=True, blank=True, help_text="Full clock-in datetime with timezone")
    clock_out_datetime = models.DateTimeField(null=True, blank=True, help_text="Full clock-out datetime with timezone")

    # LOCATION FIELDS - ADD THESE
    clock_in_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Worker's latitude when clocking in"
    )
    clock_in_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Worker's longitude when clocking in"
    )
    clock_in_distance_meters = models.FloatField(
        null=True,
        blank=True,
        help_text="Distance from workplace when clocking in (in meters)"
    )

    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)
    notes = models.TextField(max_length=500, blank=True)

    clocked_in_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='clocked_in_hours',
        help_text="User who performed clock in"
    )
    clocked_out_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='clocked_out_hours',
        help_text="User who performed clock out"
    )
    worker_signature = models.CharField(max_length=255, blank=True, help_text="Worker's digital signature")
    worker_signed_at = models.DateTimeField(null=True, blank=True)

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

    def save(self, *args, **kwargs):
        if self.clock_in_datetime and not self.clock_in:
            self.clock_in = self.clock_in_datetime.time()
        if self.clock_out_datetime and not self.clock_out:
            self.clock_out = self.clock_out_datetime.time()
        super().save(*args, **kwargs)

    @property
    def total_hours(self):
        """Calculate total working hours using datetime fields"""
        if not self.clock_out_datetime:
            return None

        if self.clock_in_datetime and self.clock_out_datetime:
            total = self.clock_out_datetime - self.clock_in_datetime
        elif self.clock_in and self.clock_out:
            from datetime import datetime
            start = datetime.combine(self.date, self.clock_in)
            end = datetime.combine(self.date, self.clock_out)
            total = end - start
        else:
            return None

        if self.break_start and self.break_end:
            from datetime import datetime
            break_start = datetime.combine(self.date, self.break_start)
            break_end = datetime.combine(self.date, self.break_end)
            break_duration = break_end - break_start
            total -= break_duration

        return total

    @property
    def is_approved(self):
        return self.status == 'APPROVED'

    @property
    def is_signed(self):
        return bool(self.worker_signature and self.worker_signed_at)

    @property
    def is_clocked_out(self):
        return self.clock_out_datetime is not None or self.clock_out is not None

    @property
    def total_hours_decimal(self):
        """Return total hours as decimal for calculations"""
        if not self.total_hours:
            return 0
        return self.total_hours.total_seconds() / 3600



class StaffInvitation(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    staff = models.OneToOneField(
        'BusinessStaff',
        on_delete=models.CASCADE,
        related_name='invitation'
    )
    business = models.ForeignKey(
        'business.Business',
        on_delete=models.CASCADE
    )
    worker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='staff_invitations'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'staff_invitations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.business.name} → {self.worker.email} ({self.status})"
