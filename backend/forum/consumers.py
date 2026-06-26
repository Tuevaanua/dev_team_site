import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Получаем ID канала из URL
        self.channel_id = self.scope['url_route']['kwargs']['channel_id']
        self.group_name = f"chat_{self.channel_id}"

        # Присоединяемся к группе канала
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def chat_message(self, event):
        # Отправляем сообщение клиенту (React)
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'data': event['message']
        }))