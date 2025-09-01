from django.contrib import admin
from .models import BusinessStaff, Shift, HoursCard


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
    list_display = ['staff', 'date', 'clock_in', 'clock_out', 'total_hours_decimal', 'status', 'approved_by']
    list_filter = ['status', 'date', 'staff__business']
    search_fields = ['staff__name', 'staff__business__name', 'notes']
    readonly_fields = ['total_hours_decimal', 'created_at', 'updated_at']
    ordering = ['-date']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Filter by user's businesses
        from business.models import Business
        user_businesses = Business.objects.filter(user=request.user)
        return qs.filter(staff__business__in=user_businesses)
