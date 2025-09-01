from rest_framework import serializers
from .models import BusinessStaff, Shift, HoursCard
from drf_spectacular.utils import extend_schema_field


class BusinessStaffSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.name', read_only=True)
    total_hours_this_month = serializers.SerializerMethodField()

    class Meta:
        model = BusinessStaff
        fields = [
            'id', 'business', 'business_name', 'user', 'name', 'staff_id',
            'job_title', 'department', 'employment_type', 'status', 'email',
            'phone', 'hourly_rate', 'hire_date', 'total_hours_this_month', 'created_at'
        ]
        read_only_fields = ['id', 'staff_id', 'created_at']

    @extend_schema_field(serializers.FloatField)
    def get_total_hours_this_month(self, obj) -> float:
        from django.utils import timezone
        from datetime import datetime
        now = timezone.now()
        month_start = datetime(now.year, now.month, 1).date()

        hours = obj.hours_cards.filter(
            date__gte=month_start,
            status='APPROVED'
        )
        return sum(card.total_hours_decimal for card in hours)


class BusinessStaffListSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.name', read_only=True)

    class Meta:
        model = BusinessStaff
        fields = [
            'id', 'business_name', 'name', 'staff_id', 'job_title',
            'employment_type', 'status', 'hire_date'
        ]


class ShiftSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    business_name = serializers.CharField(source='business.name', read_only=True)
    duration_hours = serializers.SerializerMethodField()

    class Meta:
        model = Shift
        fields = [
            'id', 'business', 'business_name', 'staff', 'staff_name',
            'name', 'shift_type', 'day_of_week', 'start_time', 'end_time',
            'break_duration', 'duration_hours', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    @extend_schema_field(serializers.FloatField)
    def get_duration_hours(self, obj) -> float:
        from datetime import datetime, timedelta
        start = datetime.combine(datetime.today(), obj.start_time)
        end = datetime.combine(datetime.today(), obj.end_time)
        duration = end - start
        if obj.break_duration:
            duration -= obj.break_duration
        return duration.total_seconds() / 3600


class HoursCardSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    shift_name = serializers.CharField(source='shift.name', read_only=True)
    total_hours_decimal = serializers.SerializerMethodField()
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)

    class Meta:
        model = HoursCard
        fields = [
            'id', 'staff', 'staff_name', 'shift', 'shift_name', 'date',
            'clock_in', 'clock_out', 'break_start', 'break_end', 'notes',
            'status', 'total_hours_decimal', 'approved_by', 'approved_by_name',
            'approved_at', 'rejection_reason', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'approved_by', 'approved_at', 'created_at', 'updated_at']

    @extend_schema_field(serializers.FloatField)
    def get_total_hours_decimal(self, obj) -> float:
        return obj.total_hours_decimal


class HoursCardListSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    total_hours_decimal = serializers.SerializerMethodField()

    class Meta:
        model = HoursCard
        fields = [
            'id', 'staff_name', 'date', 'clock_in', 'clock_out',
            'total_hours_decimal', 'status', 'created_at'
        ]

    @extend_schema_field(serializers.FloatField)
    def get_total_hours_decimal(self, obj) -> float:
        return obj.total_hours_decimal
