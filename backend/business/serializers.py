from rest_framework import serializers
from django.db import models
from .models import Business, ContactUs
from drf_spectacular.utils import extend_schema_field


class BusinessSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    total_staff = serializers.SerializerMethodField()
    total_active_staff = serializers.SerializerMethodField()
    active_jobs = serializers.SerializerMethodField()
    total_applications = serializers.SerializerMethodField()
    pending_applications = serializers.SerializerMethodField()
    total_shifts = serializers.SerializerMethodField()
    website = serializers.URLField(required=False, allow_blank=True)
    hours_pending_approval = serializers.SerializerMethodField()
    staff_on_leave = serializers.SerializerMethodField()
    accepted_applications = serializers.SerializerMethodField()
    total_hours_this_week = serializers.SerializerMethodField()


    class Meta:
        model = Business
        fields = [
            'id', 'user', 'user_name', 'name', 'business_id', 'slug',
            'category', 'size', 'description', 'email', 'phone', 'website',
            'address', 'street', 'city', 'country', 'postal_code', 'service_time',
            'is_verified', 'is_active',
            'total_staff', 'total_active_staff',
            'active_jobs', 'total_applications', 'pending_applications', 'total_shifts',
            'workplace_latitude', 'workplace_longitude',
            'clock_in_radius_meters', 'require_location_for_clock_in','hours_pending_approval', 'staff_on_leave',
            'accepted_applications', 'total_hours_this_week',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'business_id', 'slug', 'is_verified', 'created_at', 'updated_at']

    @extend_schema_field(serializers.IntegerField)
    def get_total_staff(self, obj) -> int:
        return obj.staff_members.count()

    @extend_schema_field(serializers.IntegerField)
    def get_total_active_staff(self, obj) -> int:
        return obj.staff_members.filter(status='ACTIVE').count()

    @extend_schema_field(serializers.IntegerField)
    def get_active_jobs(self, obj) -> int:
        from posts.models import Post
        return Post.objects.filter(user=obj.user, post_type='JOB', is_active=True).count()

    @extend_schema_field(serializers.IntegerField)
    def get_total_applications(self, obj) -> int:
        from posts.models import JobApplication
        return JobApplication.objects.filter(job__user=obj.user).count()

    @extend_schema_field(serializers.IntegerField)
    def get_pending_applications(self, obj) -> int:
        from posts.models import JobApplication
        return JobApplication.objects.filter(job__user=obj.user, status='PENDING').count()

    @extend_schema_field(serializers.IntegerField)
    def get_total_shifts(self, obj) -> int:
        from workforce.models import Shift
        return Shift.objects.filter(business=obj, is_active=True).count()

    @extend_schema_field(serializers.IntegerField)
    def get_hours_pending_approval(self, obj) -> int:
        from workforce.models import HoursCard
        return HoursCard.objects.filter(
            staff__business=obj, status='SIGNED'
        ).count()

    @extend_schema_field(serializers.IntegerField)
    def get_staff_on_leave(self, obj) -> int:
        return obj.staff_members.filter(status='ON_LEAVE').count()

    @extend_schema_field(serializers.IntegerField)
    def get_accepted_applications(self, obj) -> int:
        from posts.models import JobApplication
        return JobApplication.objects.filter(
            job__user=obj.user, status='ACCEPTED'
        ).count()

    @extend_schema_field(serializers.FloatField)
    def get_total_hours_this_week(self, obj) -> float:
        from workforce.models import HoursCard
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import ExpressionWrapper, F, DurationField, Sum

        week_start = timezone.now().date() - timedelta(days=timezone.now().weekday())

        result = HoursCard.objects.filter(
            staff__business=obj,
            date__gte=week_start,
            status__in=['SIGNED', 'APPROVED'],
            clock_in__isnull=False,
            clock_out__isnull=False,
        ).annotate(
            duration=ExpressionWrapper(
                F('clock_out') - F('clock_in'),
                output_field=DurationField()
            )
        ).aggregate(total=Sum('duration'))

        total = result['total']
        if not total:
            return 0.0
        return round(total.total_seconds() / 3600, 1)


class BusinessListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    total_staff = serializers.SerializerMethodField()
    total_active_staff = serializers.SerializerMethodField()
    active_jobs = serializers.SerializerMethodField()
    total_applications = serializers.SerializerMethodField()
    pending_applications = serializers.SerializerMethodField()
    total_shifts = serializers.SerializerMethodField()
    hours_pending_approval = serializers.SerializerMethodField()
    staff_on_leave = serializers.SerializerMethodField()
    accepted_applications = serializers.SerializerMethodField()
    total_hours_this_week = serializers.SerializerMethodField()

    class Meta:
        model = Business
        fields = [
            'id', 'user', 'user_name', 'name', 'business_id', 'slug',
            'category', 'size', 'description', 'email', 'phone', 'website', 'street',
            'address', 'city', 'country', 'postal_code', 'service_time',
            'is_verified', 'is_active',
            'total_staff', 'total_active_staff',
            'active_jobs', 'total_applications', 'pending_applications', 'total_shifts',
            'workplace_latitude', 'workplace_longitude',
            'clock_in_radius_meters', 'require_location_for_clock_in','hours_pending_approval', 'staff_on_leave',
            'accepted_applications', 'total_hours_this_week',
            'created_at', 'updated_at'
        ]

    @extend_schema_field(serializers.IntegerField)
    def get_total_staff(self, obj) -> int:
        return obj.staff_members.count()

    @extend_schema_field(serializers.IntegerField)
    def get_total_active_staff(self, obj) -> int:
        return obj.staff_members.filter(status='ACTIVE').count()

    @extend_schema_field(serializers.IntegerField)
    def get_active_jobs(self, obj) -> int:
        from posts.models import Post
        return Post.objects.filter(user=obj.user, post_type='JOB', is_active=True).count()

    @extend_schema_field(serializers.IntegerField)
    def get_total_applications(self, obj) -> int:
        from posts.models import JobApplication
        return JobApplication.objects.filter(job__user=obj.user).count()

    @extend_schema_field(serializers.IntegerField)
    def get_pending_applications(self, obj) -> int:
        from posts.models import JobApplication
        return JobApplication.objects.filter(job__user=obj.user, status='PENDING').count()

    @extend_schema_field(serializers.IntegerField)
    def get_total_shifts(self, obj) -> int:
        from workforce.models import Shift
        return Shift.objects.filter(business=obj, is_active=True).count()

    @extend_schema_field(serializers.IntegerField)
    def get_hours_pending_approval(self, obj) -> int:
        from workforce.models import HoursCard
        return HoursCard.objects.filter(
            staff__business=obj, status='SIGNED'
        ).count()

    @extend_schema_field(serializers.IntegerField)
    def get_staff_on_leave(self, obj) -> int:
        return obj.staff_members.filter(status='ON_LEAVE').count()

    @extend_schema_field(serializers.IntegerField)
    def get_accepted_applications(self, obj) -> int:
        from posts.models import JobApplication
        return JobApplication.objects.filter(
            job__user=obj.user, status='ACCEPTED'
        ).count()

    @extend_schema_field(serializers.FloatField)
    def get_total_hours_this_week(self, obj) -> float:
        from workforce.models import HoursCard
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import ExpressionWrapper, F, DurationField, Sum

        week_start = timezone.now().date() - timedelta(days=timezone.now().weekday())

        result = HoursCard.objects.filter(
            staff__business=obj,
            date__gte=week_start,
            status__in=['SIGNED', 'APPROVED'],
            clock_in__isnull=False,
            clock_out__isnull=False,
        ).annotate(
            duration=ExpressionWrapper(
                F('clock_out') - F('clock_in'),
                output_field=DurationField()
            )
        ).aggregate(total=Sum('duration'))

        total = result['total']
        if not total:
            return 0.0
        return round(total.total_seconds() / 3600, 1)


class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs
        fields = [
            'id', 'email_address', 'name', 'inquiry_type', 'title',
            'subject', 'is_resolved', 'created_at'
        ]
        read_only_fields = ['id', 'is_resolved', 'created_at']
