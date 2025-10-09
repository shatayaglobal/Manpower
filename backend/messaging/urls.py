from django.urls import path
from . import views


app_name = 'messaging'

urlpatterns = [
    # Message CRUD operations
    path('messages/', views.MessageListCreateView.as_view(), name='message-list-create'),
    path('messages/<int:pk>/', views.MessageRetrieveUpdateDestroyView.as_view(), name='message-detail'),

    # Conversation management
    path('conversations/', views.get_conversations, name='conversations'),
    path('messages/mark-read/', views.mark_messages_read, name='mark-messages-read'),
    path('messages/mark-all-read/', views.mark_all_messages_read, name='mark-all-messages-read'),

    # Notification features
    path('messages/unread-count/', views.get_unread_count, name='unread-count'),
    path('messages/statistics/', views.get_message_statistics, name='message-statistics'),
]
