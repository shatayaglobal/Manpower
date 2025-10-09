from django.db import models
from posts.models import JobApplication
# Create your models here.
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Messages(models.Model):
    MESSAGE_TYPES = (
        ('CHAT', 'Chat Message'),
        ('APPLICATION_ACCEPTED', 'Application Accepted'),
        ('APPLICATION_REJECTED', 'Application Rejected'),
        ('SYSTEM', 'System Notification'),
    )

    sender = models.ForeignKey(
        User,
        related_name="sent_messages",
        on_delete=models.CASCADE
    )
    receiver = models.ForeignKey(
        User,
        related_name="received_messages",
        on_delete=models.CASCADE
    )
    message = models.TextField(max_length=1000, blank=False)
    message_type = models.CharField(
        max_length=20,
        choices=MESSAGE_TYPES,
        default='CHAT'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Reference to your existing JobApplication model
    job_application = models.ForeignKey(
        'posts.JobApplication',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        help_text="Link to job application if this is application-related message"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'

    def __str__(self):
        return f"From {self.sender.email} to {self.receiver.email}: {self.message[:50]}..."

    def mark_as_read(self):
        """Mark message as read"""
        self.is_read = True
        self.save()

    @classmethod
    def get_unread_count(cls, user):
        """Get count of unread messages for a user"""
        return cls.objects.filter(receiver=user, is_read=False).count()

    @classmethod
    def get_conversations(cls, user):
        """Get all conversations for a user (grouped by other participant)"""
        from django.db.models import Q, Max

        conversations = cls.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).values('sender', 'receiver').annotate(
            last_message_time=Max('created_at')
        ).order_by('-last_message_time')

        return conversations
