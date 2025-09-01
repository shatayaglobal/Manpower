from django.contrib import admin
from django.utils import timezone
from .models import Business, ContactUs


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ['name', 'business_id', 'user', 'category', 'size', 'city', 'is_verified', 'is_active', 'created_at']
    list_filter = ['category', 'size', 'is_verified', 'is_active', 'created_at', 'city', 'country']
    search_fields = ['name', 'business_id', 'user__email', 'description']
    readonly_fields = ['business_id', 'slug', 'verification_token', 'created_at', 'updated_at']
    ordering = ['-created_at']
    actions = ['verify_businesses', 'unverify_businesses']

    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'business_id', 'slug', 'category', 'size', 'description')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'website')
        }),
        ('Location', {
            'fields': ('address', 'city', 'country', 'postal_code')
        }),
        ('Business Details', {
            'fields': ('service_time',)
        }),
        ('Status', {
            'fields': ('is_verified', 'is_active', 'verification_token')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def verify_businesses(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated} businesses verified successfully.')
    verify_businesses.short_description = "Verify selected businesses"

    def unverify_businesses(self, request, queryset):
        updated = queryset.update(is_verified=False)
        self.message_user(request, f'{updated} businesses unverified.')
    unverify_businesses.short_description = "Unverify selected businesses"


@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ['title', 'name', 'email_address', 'inquiry_type', 'is_resolved', 'created_at']
    list_filter = ['inquiry_type', 'is_resolved', 'created_at']
    search_fields = ['name', 'email_address', 'title', 'subject']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    actions = ['mark_resolved', 'mark_unresolved']

    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email_address', 'inquiry_type')
        }),
        ('Inquiry Details', {
            'fields': ('title', 'subject')
        }),
        ('Resolution', {
            'fields': ('is_resolved', 'resolved_by', 'resolved_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )

    def mark_resolved(self, request, queryset):
        updated = queryset.update(
            is_resolved=True,
            resolved_by=request.user,
            resolved_at=timezone.now()
        )
        self.message_user(request, f'{updated} inquiries marked as resolved.')
    mark_resolved.short_description = "Mark selected inquiries as resolved"

    def mark_unresolved(self, request, queryset):
        updated = queryset.update(
            is_resolved=False,
            resolved_by=None,
            resolved_at=None
        )
        self.message_user(request, f'{updated} inquiries marked as unresolved.')
    mark_unresolved.short_description = "Mark selected inquiries as unresolved"
