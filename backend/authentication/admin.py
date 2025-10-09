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
    list_display = [
        'user',
        'phone',
        'profession',
        'employment_status',
        'experience_level',
        'city',
        'country',
        'profile_completion',
        'created_at'
    ]

    list_filter = [
        'profession',
        'employment_status',
        'experience_level',
        'country',
        'marital_status',
        'gender',
        'available_for_work',
        'willing_to_relocate',
        'created_at'
    ]

    search_fields = [
        'user__email',
        'user__first_name',
        'user__last_name',
        'profession',
        'current_job_title',
        'current_company',
        'city',
        'phone'
    ]

    readonly_fields = ['id', 'created_at', 'updated_at', 'profile_completion', 'completion_percentage']

    list_per_page = 25

    fieldsets = (
        ('User Info', {
            'fields': ('user',)
        }),

        ('Personal Information', {
            'fields': (
                'phone', 'alternate_phone', 'date_of_birth', 'gender',
                'marital_status', 'nationality'
            )
        }),

        ('Address Information', {
            'fields': (
                'address', 'city', 'state', 'country', 'postal_code'
            )
        }),

        ('Professional Information', {
            'fields': (
                'profession', 'current_job_title', 'current_company',
                'employment_status', 'experience_level', 'years_of_experience'
            )
        }),

        ('Bio & Description', {
            'fields': ('bio', 'objective'),
            'classes': ('collapse',)
        }),

        ('Skills & Expertise', {
            'fields': ('skills', 'languages', 'certifications'),
            'classes': ('collapse',)
        }),

        ('Experience & Education', {
            'fields': ('work_experience', 'education'),
            'classes': ('collapse',)
        }),

        ('Additional Information', {
            'fields': ('hobbies', 'achievements', 'references'),
            'classes': ('collapse',)
        }),

        ('Salary & Availability', {
            'fields': (
                'expected_salary_min', 'expected_salary_max', 'salary_currency',
                'available_for_work', 'availability_date', 'willing_to_relocate',
                'travel_willingness'
            ),
            'classes': ('collapse',)
        }),

        ('Files & Media', {
            'fields': ('avatar', 'resume', 'portfolio'),
        }),

        ('Social & Professional Links', {
            'fields': (
                'linkedin_url', 'github_url', 'portfolio_url',
                'website_url', 'twitter_url'
            ),
            'classes': ('collapse',)
        }),

        ('Privacy & Preferences', {
            'fields': (
                'profile_visibility', 'email_notifications', 'sms_notifications'
            ),
            'classes': ('collapse',)
        }),

        ('Emergency Contact', {
            'fields': (
                'emergency_contact_name', 'emergency_contact_phone',
                'emergency_contact_relationship'
            ),
            'classes': ('collapse',)
        }),

        ('System Info', {
            'fields': ('id', 'created_at', 'updated_at', 'completion_percentage'),
            'classes': ('collapse',)
        }),
    )

    def profile_completion(self, obj):
        """Display profile completion status with color coding"""
        percentage = obj.completion_percentage
        if percentage >= 90:
            color = 'green'
            status = 'Complete'
        elif percentage >= 70:
            color = 'orange'
            status = 'Good'
        elif percentage >= 50:
            color = 'blue'
            status = 'Fair'
        else:
            color = 'red'
            status = 'Incomplete'

        return f'<span style="color: {color}; font-weight: bold;">{percentage:.0f}% ({status})</span>'

    profile_completion.allow_tags = True
    profile_completion.short_description = 'Profile Status'

    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        queryset = super().get_queryset(request)
        return queryset.select_related('user')

    # Custom actions
    actions = ['mark_available_for_work', 'mark_unavailable_for_work']

    def mark_available_for_work(self, request, queryset):
        """Mark selected profiles as available for work"""
        updated = queryset.update(available_for_work=True)
        self.message_user(request, f'{updated} profiles marked as available for work.')
    mark_available_for_work.short_description = "Mark selected profiles as available for work"

    def mark_unavailable_for_work(self, request, queryset):
        """Mark selected profiles as unavailable for work"""
        updated = queryset.update(available_for_work=False)
        self.message_user(request, f'{updated} profiles marked as unavailable for work.')
    mark_unavailable_for_work.short_description = "Mark selected profiles as unavailable for work"
