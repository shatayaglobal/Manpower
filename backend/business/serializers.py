from rest_framework import serializers
from .models import Business, ContactUs
from drf_spectacular.utils import extend_schema_field


class BusinessSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    total_staff = serializers.SerializerMethodField()
    total_active_staff = serializers.SerializerMethodField()
    website = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = Business
        fields = [
            'id', 'user', 'user_name', 'name', 'business_id', 'slug',
            'category', 'size', 'description', 'email', 'phone', 'website',
            'address', 'city', 'country', 'postal_code', 'service_time',
            'is_verified', 'is_active', 'total_staff','workplace_latitude',
            'workplace_longitude',
            'clock_in_radius_meters',   
            'require_location_for_clock_in',  'total_active_staff',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'business_id', 'slug', 'is_verified', 'created_at', 'updated_at']

    @extend_schema_field(serializers.IntegerField)
    def get_total_staff(self, obj) -> int:
        return obj.staff_members.count()

    @extend_schema_field(serializers.IntegerField)
    def get_total_active_staff(self, obj) -> int:
        return obj.staff_members.filter(status='ACTIVE').count()


class BusinessListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    total_staff = serializers.SerializerMethodField()

    class Meta:
        model = Business
        fields = [
            'id', 'user', 'user_name', 'name', 'business_id', 'slug',
            'category', 'size', 'description', 'email', 'phone', 'website',
            'address', 'city', 'country', 'postal_code', 'service_time',
            'is_verified', 'is_active', 'total_staff', 'workplace_latitude', 'workplace_longitude',
            'clock_in_radius_meters', 'require_location_for_clock_in',
            'created_at', 'updated_at'
        ]

    @extend_schema_field(serializers.IntegerField)
    def get_total_staff(self, obj) -> int:
        return obj.staff_members.filter(status='ACTIVE').count()

class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs
        fields = [
            'id', 'email_address', 'name', 'inquiry_type', 'title',
            'subject', 'is_resolved', 'created_at'
        ]
        read_only_fields = ['id', 'is_resolved', 'created_at']
