# admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Q
from .models import Messages
from posts.models import JobApplication

@admin.register(Messages)
class MessagesAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'sender_display',
        'receiver_display',
        'message_preview',
        'message_type',
        'is_read',
        'created_at'
    ]
    list_filter = [
        'message_type',
        'is_read',
        'created_at',
        'sender__account_type',
        'receiver__account_type'
    ]
    search_fields = [
        'sender__email',
        'sender__first_name',
        'sender__last_name',
        'receiver__email',
        'receiver__first_name',
        'receiver__last_name',
        'message'
    ]
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 50
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Message Details', {
            'fields': ('sender', 'receiver', 'message', 'message_type')
        }),
        ('Status', {
            'fields': ('is_read',)
        }),
        ('Related Data', {
            'fields': ('job_application',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def sender_display(self, obj):
        """Display sender with account type badge"""
        account_type = getattr(obj.sender, 'account_type', 'Unknown')
        color = 'green' if account_type == 'BUSINESS' else 'blue'
        return format_html(
            '<span style="color: {};">{} {}</span><br><small>{}</small>',
            color,
            obj.sender.first_name,
            obj.sender.last_name,
            obj.sender.email
        )
    sender_display.short_description = 'Sender'

    def receiver_display(self, obj):
        """Display receiver with account type badge"""
        account_type = getattr(obj.receiver, 'account_type', 'Unknown')
        color = 'green' if account_type == 'BUSINESS' else 'blue'
        return format_html(
            '<span style="color: {};">{} {}</span><br><small>{}</small>',
            color,
            obj.receiver.first_name,
            obj.receiver.last_name,
            obj.receiver.email
        )
    receiver_display.short_description = 'Receiver'

    def message_preview(self, obj):
        """Show truncated message with read status indicator"""
        preview = obj.message[:100] + "..." if len(obj.message) > 100 else obj.message
        status_color = 'gray' if obj.is_read else 'red'
        read_indicator = '✓' if obj.is_read else '●'
        return format_html(
            '<span style="color: {};">{}</span> {}',
            status_color,
            read_indicator,
            preview
        )
    message_preview.short_description = 'Message'

    def get_queryset(self, request):
        """Optimize queries with select_related"""
        return super().get_queryset(request).select_related(
            'sender', 'receiver', 'job_application'
        )

    actions = ['mark_as_read', 'mark_as_unread', 'delete_selected']

    def mark_as_read(self, request, queryset):
        """Mark selected messages as read"""
        updated = queryset.update(is_read=True)
        self.message_user(
            request,
            f'{updated} message(s) marked as read.'
        )
    mark_as_read.short_description = "Mark selected messages as read"

    def mark_as_unread(self, request, queryset):
        """Mark selected messages as unread"""
        updated = queryset.update(is_read=False)
        self.message_user(
            request,
            f'{updated} message(s) marked as unread.'
        )
    mark_as_unread.short_description = "Mark selected messages as unread"

    def has_add_permission(self, request):
        """Allow adding messages through admin"""
        return True

    def has_change_permission(self, request, obj=None):
        """Allow changing messages"""
        return True

    def has_delete_permission(self, request, obj=None):
        """Allow deleting messages"""
        return True
