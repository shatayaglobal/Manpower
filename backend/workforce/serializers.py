from rest_framework import serializers
from .models import BusinessStaff, Shift, HoursCard, StaffInvitation
from drf_spectacular.utils import extend_schema_field


class BusinessStaffSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.name', read_only=True)
    total_hours_this_month = serializers.SerializerMethodField()

    invitation_status = serializers.SerializerMethodField()
    invitation_responded_at = serializers.SerializerMethodField()

    class Meta:
        model = BusinessStaff
        fields = [
            'id', 'business', 'business_name', 'user', 'name', 'staff_id',
            'job_title', 'department', 'employment_type', 'status', 'email',
            'phone', 'hourly_rate', 'hire_date', 'total_hours_this_month', 'created_at',
            'invitation_status', 'invitation_responded_at'
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

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_invitation_status(self, obj):
        """Get invitation status if exists"""
        try:
            return obj.invitation.status
        except:
            return None

    @extend_schema_field(serializers.DateTimeField(allow_null=True))
    def get_invitation_responded_at(self, obj):
        """Get when invitation was responded to"""
        try:
            return obj.invitation.responded_at
        except:
            return None


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

    # For writing - accept lists
    staff = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=True
    )
    day_of_week = serializers.ListField(
        child=serializers.ChoiceField(choices=Shift.DAYS_OF_WEEK),
        write_only=True,
        required=True
    )

    # For reading - return single values
    staff_id = serializers.UUIDField(source='staff.id', read_only=True)
    day_of_week_value = serializers.CharField(source='day_of_week', read_only=True)

    class Meta:
        model = Shift
        fields = [
            'id', 'business', 'business_name',
            'staff', 'staff_id', 'staff_name',  # Keep these
            'name', 'shift_type',
            'day_of_week', 'day_of_week_value',  # Keep these
            'start_time', 'end_time',
            'break_duration', 'duration_hours', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'staff': {'write_only': True},
            'day_of_week': {'write_only': True}
        }

    @extend_schema_field(serializers.FloatField)
    def get_duration_hours(self, obj) -> float:
        from datetime import datetime
        start = datetime.combine(datetime.today(), obj.start_time)
        end = datetime.combine(datetime.today(), obj.end_time)
        duration = end - start
        if obj.break_duration:
            duration -= obj.break_duration
        return duration.total_seconds() / 3600

    def to_representation(self, instance):
        """Map read fields back to expected names"""
        data = super().to_representation(instance)
        data['staff'] = data.pop('staff_id')
        data['day_of_week'] = data.pop('day_of_week_value')
        return data

    def create(self, validated_data):
        staff_ids = validated_data.pop('staff')
        days_list = validated_data.pop('day_of_week')

        shifts = []
        for staff_id in staff_ids:
            for day in days_list:
                shift = Shift.objects.create(
                    staff_id=staff_id,
                    day_of_week=day,
                    **validated_data
                )
                shifts.append(shift)

        return shifts[0] if shifts else None

    def update(self, instance, validated_data):
        staff_ids = validated_data.pop('staff', None)
        days_list = validated_data.pop('day_of_week', None)

        if staff_ids:
            instance.staff_id = staff_ids[0]
        if days_list:
            instance.day_of_week = days_list[0]

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    @extend_schema_field(serializers.FloatField)
    def get_duration_hours(self, obj) -> float:
        from datetime import datetime
        start = datetime.combine(datetime.today(), obj.start_time)
        end = datetime.combine(datetime.today(), obj.end_time)
        duration = end - start
        if obj.break_duration:
            duration -= obj.break_duration
        return duration.total_seconds() / 3600

    def to_representation(self, instance):
        """Return single values for read operations"""
        data = super().to_representation(instance)
        # Map read-only fields to expected names
        data['staff'] = data.pop('staff_id')
        data['day_of_week'] = data.pop('day_of_week_value')
        return data

    def create(self, validated_data):
    # Extract arrays (now they're UUIDs, not objects)
        staff_ids = validated_data.pop('staff')
        days_list = validated_data.pop('day_of_week')

        shifts = []
        for staff_id in staff_ids:
            for day in days_list:
                shift = Shift.objects.create(
                    staff_id=staff_id,  # Use staff_id to assign by UUID
                    day_of_week=day,
                    **validated_data
                )
                shifts.append(shift)

        return shifts[0] if shifts else None

    def update(self, instance, validated_data):
        staff_list = validated_data.pop('staff', None)
        days_list = validated_data.pop('day_of_week', None)

        if staff_list:
            instance.staff = staff_list[0]
        if days_list:
            instance.day_of_week = days_list[0]

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class ShiftSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    business_name = serializers.CharField(source='business.name', read_only=True)
    duration_hours = serializers.SerializerMethodField()

    # For reading only
    staff = serializers.UUIDField(source='staff.id', read_only=True)
    day_of_week = serializers.CharField(read_only=True)

    class Meta:
        model = Shift
        fields = [
            'id', 'business', 'business_name',
            'staff', 'staff_name',
            'name', 'shift_type',
            'day_of_week',
            'start_time', 'end_time',
            'break_duration', 'duration_hours', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'staff', 'day_of_week']

    @extend_schema_field(serializers.FloatField)
    def get_duration_hours(self, obj) -> float:
        from datetime import datetime
        start = datetime.combine(datetime.today(), obj.start_time)
        end = datetime.combine(datetime.today(), obj.end_time)
        duration = end - start
        if obj.break_duration:
            duration -= obj.break_duration
        return duration.total_seconds() / 3600

    def to_internal_value(self, data):
        # Intercept and validate arrays before they hit model validation
        staff_list = data.get('staff')
        day_list = data.get('day_of_week')

        # Validate arrays
        if not staff_list or not isinstance(staff_list, list):
            raise serializers.ValidationError({'staff': 'Staff must be a list'})
        if not day_list or not isinstance(day_list, list):
            raise serializers.ValidationError({'day_of_week': 'Days must be a list'})

        # Remove from data to avoid model validation
        data_copy = data.copy()
        data_copy.pop('staff', None)
        data_copy.pop('day_of_week', None)

        # Get validated data from parent
        validated = super().to_internal_value(data_copy)

        # Add our arrays back
        validated['staff_list'] = staff_list
        validated['day_list'] = day_list

        return validated

    def create(self, validated_data):
        staff_ids = validated_data.pop('staff_list')
        days_list = validated_data.pop('day_list')

        shifts = []
        for staff_id in staff_ids:
            for day in days_list:
                shift = Shift.objects.create(
                    staff_id=staff_id,
                    day_of_week=day,
                    **validated_data
                )
                shifts.append(shift)

        return shifts[0] if shifts else None

    def update(self, instance, validated_data):
        staff_ids = validated_data.pop('staff_list', None)
        days_list = validated_data.pop('day_list', None)

        if staff_ids:
            instance.staff_id = staff_ids[0]
        if days_list:
            instance.day_of_week = days_list[0]

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class HoursCardSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    shift_name = serializers.CharField(source='shift.name', read_only=True, allow_null=True)
    total_hours_decimal = serializers.SerializerMethodField()

    # Approval fields
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, allow_null=True)

    # Clock in/out tracking
    clocked_in_by_name = serializers.CharField(source='clocked_in_by.get_full_name', read_only=True, allow_null=True)
    clocked_out_by_name = serializers.CharField(source='clocked_out_by.get_full_name', read_only=True, allow_null=True)

    # Status flags
    is_signed = serializers.ReadOnlyField()
    is_clocked_out = serializers.ReadOnlyField()

    class Meta:
        model = HoursCard
        fields = [
            'id', 'staff', 'staff_name', 'shift', 'shift_name',
            'date',
            'clock_in', 'clock_out',
            'clock_in_datetime', 'clock_out_datetime',
            'clock_in_latitude', 'clock_in_longitude',
            'break_start', 'break_end', 'notes',
            'clocked_in_by', 'clocked_in_by_name',
            'clocked_out_by', 'clocked_out_by_name',
            'worker_signature', 'worker_signed_at',
            'status',
            'approved_by', 'approved_by_name',
            'approved_at', 'rejection_reason',
            'total_hours_decimal',
            'is_signed', 'is_clocked_out', 'is_approved',
            'clock_in_distance_meters',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'clocked_in_by', 'clocked_out_by', 'worker_signed_at',
            'approved_by', 'approved_at', 'created_at', 'updated_at'
        ]

    @extend_schema_field(serializers.FloatField)
    def get_total_hours_decimal(self, obj) -> float:
        return obj.total_hours_decimal



class HoursCardListSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    total_hours_decimal = serializers.SerializerMethodField()
    is_signed = serializers.ReadOnlyField()
    is_clocked_out = serializers.ReadOnlyField()

    class Meta:
        model = HoursCard
        fields = [
            'id', 'staff_name', 'date',
            'clock_in', 'clock_out',
            'clock_in_datetime', 'clock_out_datetime',
            'clock_in_distance_meters',
            'total_hours_decimal', 'status', 'is_signed', 'is_clocked_out',
            'worker_signed_at', 'created_at'
        ]

    @extend_schema_field(serializers.FloatField)
    def get_total_hours_decimal(self, obj) -> float:
        return obj.total_hours_decimal

class StaffInvitationSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.name', read_only=True)
    job_title = serializers.CharField(source='staff.job_title', read_only=True)
    department = serializers.CharField(source='staff.department', read_only=True)
    employment_type = serializers.CharField(source='staff.employment_type', read_only=True)
    hire_date = serializers.DateField(source='staff.hire_date', read_only=True)

    class Meta:
        model = StaffInvitation
        fields = [
            'id', 'business_name', 'job_title', 'department',
            'employment_type', 'hire_date', 'message', 'status',
            'created_at', 'responded_at'
        ]
        read_only_fields = ['id', 'created_at', 'responded_at']
