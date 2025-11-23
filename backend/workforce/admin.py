from datetime import timezone
from django.contrib import admin
from .models import BusinessStaff, Shift, HoursCard, StaffInvitation


@admin.register(BusinessStaff)
class BusinessStaffAdmin(admin.ModelAdmin):
    list_display = ['name', 'staff_id', 'business', 'job_title', 'employment_type', 'status', 'hire_date']
    list_filter = ['employment_type', 'status', 'job_title', 'hire_date']
    search_fields = ['name', 'staff_id', 'email', 'business__name']
    readonly_fields = ['staff_id', 'created_at', 'updated_at']
    ordering = ['-hire_date']


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ['name', 'staff', 'business', 'shift_type', 'day_of_week', 'start_time', 'end_time', 'is_active']
    list_filter = ['shift_type', 'day_of_week', 'is_active', 'business']
    search_fields = ['name', 'staff__name', 'business__name']
    ordering = ['day_of_week', 'start_time']


@admin.register(HoursCard)
class HoursCardAdmin(admin.ModelAdmin):
    list_display = [
        'staff',
        'date',
        'clock_in_datetime',  # NEW - show datetime instead of just time
        'clock_out_datetime',  # NEW
        'total_hours_decimal',
        'status',
        'is_signed',
        'created_at'
    ]
    list_filter = ['status', 'date', 'created_at', 'staff__business']
    search_fields = ['staff__name', 'notes', 'rejection_reason']
    readonly_fields = ['created_at', 'updated_at', 'total_hours_decimal']
    ordering = ['-date', '-clock_in_datetime']
    actions = ['approve_hours', 'reject_hours']

    fieldsets = (
        ('Staff Information', {
            'fields': ('staff', 'shift', 'date')
        }),
        ('Clock Times', {
            'fields': (
                'clock_in_datetime',     # NEW - primary field
                'clock_out_datetime',    # NEW - primary field
                'clock_in',              # Keep for backward compatibility
                'clock_out',             # Keep for backward compatibility
                'break_start',
                'break_end'
            ),
            'description': 'Use datetime fields for accurate timezone handling. Time fields are kept for backward compatibility.'
        }),
        ('Clock Actions', {
            'fields': ('clocked_in_by', 'clocked_out_by')
        }),
        ('Worker Signature', {
            'fields': ('worker_signature', 'worker_signed_at')
        }),
        ('Approval', {
            'fields': ('status', 'approved_by', 'approved_at', 'rejection_reason')
        }),
        ('Additional Info', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'total_hours_decimal'),
            'classes': ('collapse',)
        }),
    )

    def approve_hours(self, request, queryset):
        updated = queryset.update(
            status='APPROVED',
            approved_by=request.user,
            approved_at=timezone.now()
        )
        self.message_user(request, f'{updated} hour cards approved successfully.')
    approve_hours.short_description = "Approve selected hour cards"

    def reject_hours(self, request, queryset):
        updated = queryset.update(
            status='REJECTED',
            approved_by=request.user,
            approved_at=timezone.now()
        )
        self.message_user(request, f'{updated} hour cards rejected.')
    reject_hours.short_description = "Reject selected hour cards"

    def total_hours_decimal(self, obj):
        return f"{obj.total_hours_decimal:.2f}h" if obj.total_hours_decimal else "N/A"
    total_hours_decimal.short_description = "Total Hours"


@admin.register(StaffInvitation)
class StaffInvitationAdmin(admin.ModelAdmin):
    list_display = ['worker', 'business', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['worker__email', 'business__name']
    readonly_fields = ['created_at', 'responded_at']
