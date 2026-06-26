import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ProjectCommentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        
        if self.user.is_anonymous:
            await self.close()
        else:
            self.group_name = f"project_comments_{self.project_id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def new_comment(self, event):
        comment_data = event["comment"]
        await self.send(text_data=json.dumps({
            "type": "new_comment",
            "data": comment_data
        }))