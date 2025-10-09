import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Messages
from .serializers import MessageSerializer

def convert_uuids_to_strings(data):
    """Recursively convert all UUID objects to strings"""
    if isinstance(data, dict):
        return {key: convert_uuids_to_strings(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_uuids_to_strings(item) for item in data]
    elif hasattr(data, 'hex'):
        return str(data)
    else:
        return data

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope['query_string'].decode()
        token = None

        if 'token=' in query_string:
            token = query_string.split('token=')[1].split('&')[0]

        if not token:
            print("No token provided in WebSocket connection")
            await self.close()
            return

        user = await self.get_user_from_token(token)
        if not user:
            print("Invalid token or user not found")
            await self.close()
            return

        self.user = user
        self.user_id = str(self.user.id)
        self.user_group_name = f"user_{self.user_id}"

        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"WebSocket connected for user: {self.user.email}")

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            return user
        except Exception as e:
            print(f"Token validation failed: {e}")
            return None

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'send_message':
                await self.handle_send_message(data)
            elif message_type == 'mark_read':
                await self.handle_mark_read(data)

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))

    async def handle_send_message(self, data):
        receiver_id = data.get('receiver_id')
        message_text = data.get('message')
        message_type = data.get('message_type', 'CHAT')

        print(f"Creating message: sender={self.user.id}, receiver={receiver_id}")

        if not receiver_id or not message_text:
            await self.send(text_data=json.dumps({
                'error': 'Missing receiver_id or message'
            }))
            return

        message = await self.create_message(
            sender_id=self.user.id,
            receiver_id=receiver_id,
            message=message_text,
            message_type=message_type
        )

        if message:
            message_data = await self.serialize_message(message)

            # Get unread count for receiver
            receiver_unread_count = await self.get_unread_count(receiver_id)

            # Send to receiver with their unread count
            await self.channel_layer.group_send(
                f"user_{receiver_id}",
                {
                    'type': 'new_message',
                    'message': message_data,
                    'unread_count': receiver_unread_count
                }
            )

            # Confirm to sender (no unread count update for sender)
            await self.send(text_data=json.dumps({
                'type': 'message_sent',
                'message': message_data
            }))

    async def handle_mark_read(self, data):
        other_user_id = data.get('other_user_id')
        if other_user_id:
            await self.mark_messages_read(self.user.id, other_user_id)

            # Get updated unread count
            unread_count = await self.get_unread_count(self.user.id)

            await self.send(text_data=json.dumps({
                'type': 'messages_marked_read',
                'other_user_id': other_user_id,
                'unread_count': unread_count
            }))

    async def new_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message'],
            'unread_count': event.get('unread_count', 0)
        }))

    @database_sync_to_async
    def create_message(self, sender_id, receiver_id, message, message_type):
        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)

            message_obj = Messages.objects.create(
                sender=sender,
                receiver=receiver,
                message=message,
                message_type=message_type
            )
            return message_obj
        except Exception as e:
            print(f"Error creating message: {e}")
            return None

    @database_sync_to_async
    def serialize_message(self, message):
        serializer = MessageSerializer(message)
        data = serializer.data
        data = convert_uuids_to_strings(data)
        return data

    @database_sync_to_async
    def mark_messages_read(self, user_id, other_user_id):
        Messages.objects.filter(
            sender_id=other_user_id,
            receiver_id=user_id,
            is_read=False
        ).update(is_read=True)

    @database_sync_to_async
    def get_unread_count(self, user_id):
        """Get total unread message count for a user"""
        return Messages.objects.filter(
            receiver_id=user_id,
            is_read=False
        ).count()
