# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Messages
# Import your existing serializers from the correct apps
from authentication.serializers import UserListSerializer
from posts.serializers import JobApplicationListSerializer

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    """Main serializer for Messages"""
    sender_info = UserListSerializer(source='sender', read_only=True)
    receiver_info = UserListSerializer(source='receiver', read_only=True)
    job_application_info = JobApplicationListSerializer(source='job_application', read_only=True)
    time_ago = serializers.SerializerMethodField()
    is_sender = serializers.SerializerMethodField()

    class Meta:
        model = Messages
        fields = [
            'id', 'sender', 'receiver', 'message', 'message_type',
            'is_read', 'created_at', 'updated_at', 'job_application',
            'sender_info', 'receiver_info', 'job_application_info',
            'time_ago', 'is_sender'
        ]
        read_only_fields = ['sender', 'created_at', 'updated_at', 'sender_info', 'receiver_info']

    def get_time_ago(self, obj):
        """Get human-readable time ago"""
        from django.utils import timezone
        import datetime

        now = timezone.now()
        diff = now - obj.created_at

        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"

    def get_is_sender(self, obj):
        """Check if current user is the sender"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.sender == request.user
        return False

    def validate(self, data):
        """Custom validation"""
        request = self.context.get('request')

        # Check if user is trying to send message to themselves
        if request and data.get('receiver') == request.user:
            raise serializers.ValidationError("Cannot send message to yourself")

        # Validate message content
        message = data.get('message', '').strip()
        if not message:
            raise serializers.ValidationError("Message cannot be empty")

        if len(message) > 1000:
            raise serializers.ValidationError("Message too long (max 1000 characters)")

        return data

    def validate_receiver(self, value):
        """Validate receiver exists and is active"""
        if not value.is_active:
            raise serializers.ValidationError("Cannot send message to inactive user")
        return value


class MessageCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating messages"""

    class Meta:
        model = Messages
        fields = ['receiver', 'message', 'message_type', 'job_application']

    def validate(self, data):
        """Custom validation for message creation"""
        request = self.context.get('request')

        # Check if user is trying to send message to themselves
        if request and data.get('receiver') == request.user:
            raise serializers.ValidationError("Cannot send message to yourself")

        # Validate message content
        message = data.get('message', '').strip()
        if not message:
            raise serializers.ValidationError("Message cannot be empty")

        return data


class ConversationSerializer(serializers.Serializer):
    """Serializer for conversation list"""
    other_user = serializers.SerializerMethodField()
    last_message = serializers.CharField()
    last_message_time = serializers.DateTimeField()
    last_message_type = serializers.CharField()
    unread_count = serializers.IntegerField()
    total_messages = serializers.IntegerField()

    def get_other_user(self, obj):
        """Get other user info from conversation"""
        return obj.get('other_user', {})


class MessageUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating messages (mainly for marking as read)"""

    class Meta:
        model = Messages
        fields = ['is_read', 'message']

    def validate(self, data):
        """Custom validation for message updates"""
        request = self.context.get('request')
        instance = getattr(self, 'instance', None)

        if instance:
            # If not the sender, only allow marking as read
            if instance.sender != request.user:
                allowed_fields = {'is_read'}
                if not set(data.keys()).issubset(allowed_fields):
                    raise serializers.ValidationError(
                        "You can only mark messages as read"
                    )

            # If trying to update message content, must be sender
            if 'message' in data and instance.sender != request.user:
                raise serializers.ValidationError(
                    "Only sender can edit message content"
                )

        return data


class UnreadCountSerializer(serializers.Serializer):
    """Serializer for unread message count response"""
    unread_count = serializers.IntegerField()
    unread_by_type = serializers.DictField()


class MarkAsReadSerializer(serializers.Serializer):
    """Serializer for mark as read request"""
    other_user_id = serializers.IntegerField()

    def validate_other_user_id(self, value):
        """Validate that the user exists"""
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")
        return value


class MessageStatisticsSerializer(serializers.Serializer):
    """Serializer for message statistics response"""
    total_sent = serializers.IntegerField()
    total_received = serializers.IntegerField()
    unread_received = serializers.IntegerField()
    conversations_count = serializers.IntegerField()
    by_message_type = serializers.DictField()


# Optional: Nested serializer for detailed conversation view
class ConversationDetailSerializer(serializers.Serializer):
    """Detailed conversation with recent messages"""
    other_user = UserListSerializer()
    messages = MessageSerializer(many=True)
    unread_count = serializers.IntegerField()
    total_messages = serializers.IntegerField()


# Optional: Serializer for bulk operations
class BulkMessageActionSerializer(serializers.Serializer):
    """Serializer for bulk message actions"""
    message_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    action = serializers.ChoiceField(choices=['mark_read', 'mark_unread', 'delete'])

    def validate_message_ids(self, value):
        """Validate that all message IDs exist and user has permission"""
        request = self.context.get('request')
        user = request.user if request else None

        if not user:
            raise serializers.ValidationError("Authentication required")

        messages = Messages.objects.filter(
        Q(sender=user) | Q(receiver=user),
        id__in=value
    )
        if messages.count() != len(value):
            raise serializers.ValidationError("Some messages not found or no permission")

        return value
