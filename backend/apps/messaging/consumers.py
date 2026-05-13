import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, Conversation
from apps.users.models import User


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id    = self.scope['url_route']['kwargs']['room_id']
        self.room_group = f'chat_{self.room_id}'
        user = self.scope.get('user')

        if not user or not user.is_authenticated:
            await self.close()
            return

        # Verify user is a participant
        if not await self.is_participant(user, self.room_id):
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        user = self.scope['user']
        msg  = await self.save_message(user, data)
        await self.channel_layer.group_send(self.room_group, {
            'type': 'chat_message',
            'message': msg,
        })

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def is_participant(self, user, room_id):
        return Conversation.objects.filter(id=room_id, participants=user).exists()

    @database_sync_to_async
    def save_message(self, user, data):
        conv = Conversation.objects.get(id=self.room_id)
        msg  = Message.objects.create(
            conversation=conv,
            sender=user,
            content=data.get('content', ''),
            file_url=data.get('file_url', ''),
            file_type=data.get('file_type', ''),
            file_name=data.get('file_name', ''),
        )
        return {
            'id': msg.id,
            'sender_id': str(user.id),
            'sender_name': user.full_name,
            'content': msg.content,
            'file_url': msg.file_url,
            'file_name': msg.file_name,
            'sent_at': msg.sent_at.isoformat(),
        }
