# views.py - Complete Message Views
from datetime import timezone
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.openapi import OpenApiTypes
from django.db.models import Q, Count, Max, Case, When
from django.utils import timezone as django_timezone
from .models import Messages, User, JobApplication
from .serializers import MessageSerializer, ConversationSerializer


class MessageListCreateView(generics.ListCreateAPIView):
    """List messages between two users or create a new message"""
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['message_type', 'is_read']
    ordering_fields = ['created_at']
    ordering = ['created_at']

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.request.query_params.get('other_user', None)

        if other_user_id:
            # Get conversation between current user and specific user
            return Messages.objects.filter(
                Q(sender=user, receiver_id=other_user_id) |
                Q(sender_id=other_user_id, receiver=user)
            ).select_related('sender', 'receiver', 'job_application')

        # Get all messages for current user
        return Messages.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related('sender', 'receiver', 'job_application')

    def perform_create(self, serializer):
        # Validate receiver exists and is different from sender
        receiver_id = serializer.validated_data.get('receiver')
        if receiver_id == self.request.user:
            raise ValidationError("Cannot send message to yourself")

        serializer.save(sender=self.request.user)

    @extend_schema(
        summary="List messages",
        description="Get messages between current user and another user. If no other_user specified, returns all user's messages.",
        parameters=[
            OpenApiParameter(
                name='other_user',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='ID of the other user to get conversation with'
            ),
            OpenApiParameter(
                name='message_type',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Filter by message type (CHAT, APPLICATION_ACCEPTED, APPLICATION_REJECTED, SYSTEM)'
            ),
            OpenApiParameter(
                name='is_read',
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description='Filter by read status'
            ),
        ],
        responses={
            200: MessageSerializer(many=True),
            401: OpenApiResponse(description="Authentication required"),
        }
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Send message",
        description="Send a new message to another user",
        request=MessageSerializer,
        responses={
            201: MessageSerializer,
            400: OpenApiResponse(description="Invalid data"),
            401: OpenApiResponse(description="Authentication required"),
        }
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class MessageRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific message"""
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Messages.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        ).select_related('sender', 'receiver', 'job_application')

    def perform_update(self, serializer):
        message = self.get_object()
        # Only sender can edit message content, receiver can only mark as read
        if message.sender != self.request.user:
            # Only allow marking as read for receivers
            allowed_fields = {'is_read'}
            if not set(serializer.validated_data.keys()).issubset(allowed_fields):
                raise PermissionDenied("You can only mark messages as read")
        serializer.save()

    def perform_destroy(self, instance):
        # Only sender can delete messages
        if instance.sender != self.request.user:
            raise PermissionDenied("You can only delete your own messages")
        instance.delete()

    @extend_schema(
        summary="Get message",
        description="Retrieve a specific message by ID",
        responses={
            200: MessageSerializer,
            403: OpenApiResponse(description="Permission denied"),
            404: OpenApiResponse(description="Message not found"),
        }
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update message",
        description="Update message (sender can edit content, receiver can mark as read)",
        request=MessageSerializer,
        responses={
            200: MessageSerializer,
            403: OpenApiResponse(description="Permission denied"),
            404: OpenApiResponse(description="Message not found"),
        }
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        summary="Delete message",
        description="Delete message (sender only)",
        responses={
            204: OpenApiResponse(description="Message deleted"),
            403: OpenApiResponse(description="Permission denied"),
            404: OpenApiResponse(description="Message not found"),
        }
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


@extend_schema(
    summary="Get conversations",
    description="Get list of all conversations for the current user with unread message counts and last message info",
    responses={
        200: {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "other_user": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "integer"},
                            "name": {"type": "string"},
                            "email": {"type": "string"},
                            "account_type": {"type": "string"}
                        }
                    },
                    "last_message": {"type": "string"},
                    "last_message_time": {"type": "string", "format": "date-time"},
                    "last_message_type": {"type": "string"},
                    "unread_count": {"type": "integer"},
                    "total_messages": {"type": "integer"}
                }
            }
        },
        401: OpenApiResponse(description="Authentication required"),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    """Get all conversations for the current user"""
    user = request.user

    # Get all unique users the current user has messaged with
    user_messages = Messages.objects.filter(
        Q(sender=user) | Q(receiver=user)
    ).values_list('sender', 'receiver', flat=False)

    # Get unique other users
    other_user_ids = set()
    for sender_id, receiver_id in user_messages:
        if sender_id == user.id:
            other_user_ids.add(receiver_id)
        else:
            other_user_ids.add(sender_id)

    conversation_list = []

    for other_user_id in other_user_ids:
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            continue

        # Get last message in conversation
        last_message = Messages.objects.filter(
            Q(sender=user, receiver=other_user) |
            Q(sender=other_user, receiver=user)
        ).order_by('-created_at').first()

        if not last_message:
            continue

        # Count unread messages from this user
        unread_count = Messages.objects.filter(
            sender=other_user,
            receiver=user,
            is_read=False
        ).count()

        # Count total messages in conversation
        total_messages = Messages.objects.filter(
            Q(sender=user, receiver=other_user) |
            Q(sender=other_user, receiver=user)
        ).count()

        conversation_list.append({
            'other_user': {
                'id': other_user.id,
                'name': f"{other_user.first_name} {other_user.last_name}",
                'email': other_user.email,
                'account_type': getattr(other_user, 'account_type', 'WORKER')
            },
            'last_message': last_message.message,
            'last_message_time': last_message.created_at,
            'last_message_type': last_message.message_type,
            'unread_count': unread_count,
            'total_messages': total_messages
        })

    # Sort by last message time (most recent first)
    conversation_list.sort(key=lambda x: x['last_message_time'], reverse=True)

    return Response(conversation_list)


@extend_schema(
    summary="Mark messages as read",
    description="Mark all messages from a specific user as read",
    request={
        "type": "object",
        "properties": {
            "other_user_id": {
                "type": "integer",
                "description": "ID of the user whose messages to mark as read"
            }
        },
        "required": ["other_user_id"]
    },
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "marked_count": {"type": "integer"}
            }
        },
        400: OpenApiResponse(description="Invalid data - other_user_id required"),
        401: OpenApiResponse(description="Authentication required"),
        404: OpenApiResponse(description="User not found"),
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request):
    """Mark messages as read between current user and another user"""
    other_user_id = request.data.get('other_user_id')

    if not other_user_id:
        return Response(
            {'error': 'other_user_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify other user exists
    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Mark messages as read
    marked_count = Messages.objects.filter(
        sender=other_user,
        receiver=request.user,
        is_read=False
    ).update(is_read=True)

    return Response({
        'message': f'Marked {marked_count} messages as read',
        'marked_count': marked_count
    })


@extend_schema(
    summary="Get unread message count",
    description="Get total number of unread messages for the current user (for navbar notification badge)",
    responses={
        200: {
            "type": "object",
            "properties": {
                "unread_count": {
                    "type": "integer",
                    "description": "Total number of unread messages"
                },
                "unread_by_type": {
                    "type": "object",
                    "properties": {
                        "CHAT": {"type": "integer"},
                        "APPLICATION_ACCEPTED": {"type": "integer"},
                        "APPLICATION_REJECTED": {"type": "integer"},
                        "SYSTEM": {"type": "integer"}
                    }
                }
            }
        },
        401: OpenApiResponse(description="Authentication required"),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request):
    """Get total unread message count for navbar notification"""
    user = request.user

    # Total unread count
    total_unread = Messages.objects.filter(receiver=user, is_read=False).count()

    # Unread count by message type
    unread_by_type = {}
    for msg_type, _ in Messages.MESSAGE_TYPES:
        count = Messages.objects.filter(
            receiver=user,
            is_read=False,
            message_type=msg_type
        ).count()
        unread_by_type[msg_type] = count

    return Response({
        'unread_count': total_unread,
        'unread_by_type': unread_by_type
    })


@extend_schema(
    summary="Mark all messages as read",
    description="Mark all unread messages for the current user as read",
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "marked_count": {"type": "integer"}
            }
        },
        401: OpenApiResponse(description="Authentication required"),
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_messages_read(request):
    """Mark all unread messages for current user as read"""
    marked_count = Messages.objects.filter(
        receiver=request.user,
        is_read=False
    ).update(is_read=True)

    return Response({
        'message': f'Marked {marked_count} messages as read',
        'marked_count': marked_count
    })


# Function to create automatic messages when application status changes
def create_application_message(job_application, old_status, new_status):
    """Create automatic message when application status changes"""
    if old_status == new_status:
        return None

    if new_status == 'ACCEPTED':
        message_text = f"Congratulations! Your application for '{job_application.job.title}' has been accepted. The employer is now available to chat with you about next steps."
        message_type = 'APPLICATION_ACCEPTED'
    elif new_status == 'REJECTED':
        message_text = f"Thank you for your interest in '{job_application.job.title}'. Unfortunately, your application was not selected this time. Keep applying - the right opportunity is out there!"
        message_type = 'APPLICATION_REJECTED'
    else:
        return None

    # Create the message
    message = Messages.objects.create(
        sender=job_application.job.user,  # Business owner sends the message
        receiver=job_application.applicant,  # Worker receives the message
        message=message_text,
        message_type=message_type,
        job_application=job_application
    )

    return message

def create_application_submission_message(job_application):
    """Create initial message when worker submits application"""
    message_text = f"Hi! I've just applied for your '{job_application.job.title}' position. I'm excited about this opportunity and happy to answer any questions you might have."

    message = Messages.objects.create(
        sender=job_application.applicant,
        receiver=job_application.job.user,
        message=message_text,
        message_type='CHAT',
        job_application=job_application
    )

    return message


# You can also add this helper view to get message statistics
@extend_schema(
    summary="Get message statistics",
    description="Get message statistics for the current user",
    responses={
        200: {
            "type": "object",
            "properties": {
                "total_sent": {"type": "integer"},
                "total_received": {"type": "integer"},
                "unread_received": {"type": "integer"},
                "conversations_count": {"type": "integer"},
                "by_message_type": {
                    "type": "object",
                    "additionalProperties": {"type": "integer"}
                }
            }
        },
        401: OpenApiResponse(description="Authentication required"),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_message_statistics(request):
    """Get message statistics for current user"""
    user = request.user

    # Basic counts
    total_sent = Messages.objects.filter(sender=user).count()
    total_received = Messages.objects.filter(receiver=user).count()
    unread_received = Messages.objects.filter(receiver=user, is_read=False).count()

    # Count unique conversations
    sent_to = set(Messages.objects.filter(sender=user).values_list('receiver', flat=True))
    received_from = set(Messages.objects.filter(receiver=user).values_list('sender', flat=True))
    conversations_count = len(sent_to.union(received_from))

    # Count by message type
    by_message_type = {}
    for msg_type, _ in Messages.MESSAGE_TYPES:
        count = Messages.objects.filter(
            Q(sender=user) | Q(receiver=user),
            message_type=msg_type
        ).count()
        by_message_type[msg_type] = count

    return Response({
        'total_sent': total_sent,
        'total_received': total_received,
        'unread_received': unread_received,
        'conversations_count': conversations_count,
        'by_message_type': by_message_type
    })
