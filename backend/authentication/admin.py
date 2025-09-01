from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'account_type', 'is_google_user', 'is_verified', 'date_joined']
    list_filter = ['account_type', 'is_google_user', 'is_verified', 'is_staff', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['email']
    filter_horizontal = ['groups', 'user_permissions']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'account_type')}),
        ('Google OAuth', {'fields': ('google_id', 'is_google_user')}),
        ('Status', {'fields': ('is_verified', 'is_active', 'is_staff', 'is_superuser')}),
        ('Permissions', {'fields': ('groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'account_type', 'password1', 'password2'),
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'profession', 'created_at']
    list_filter = ['profession', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'profession']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('User Info', {'fields': ('user',)}),
        ('Contact Info', {'fields': ('address', 'phone')}),
        ('Professional Info', {'fields': ('profession', 'bio', 'linkedin_url', 'website_url')}),
        ('Personal Info', {'fields': ('date_of_birth', 'avatar')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
