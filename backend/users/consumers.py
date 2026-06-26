import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        # Строгая защита: отключаем анонимов
        if self.user.is_anonymous:
            await self.close()
        else:
            # Создаем персональную комнату для пользователя
            self.group_name = f"user_notifications_{self.user.id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # Кастомный обработчик события для отправки уведомлений
async def send_notification(self, event):
        # Отправляем данные в React-компонент Layout.jsx
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'data': event['notification']
        }))