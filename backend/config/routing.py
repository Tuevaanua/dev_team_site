from django.urls import re_path

# Импортируем наши актуальные консьюмеры
from users.consumers import NotificationConsumer
from projects.consumers import ProjectCommentConsumer
from forum.consumers import ChatConsumer

websocket_urlpatterns = [
    # 1. Персональные уведомления пользователя (колокольчик)
    re_path(r'^ws/notifications/$', NotificationConsumer.as_asgi()),
    
    # 2. Живые комментарии под конкретным проектом
    re_path(r'^ws/projects/(?P<project_id>\w+)/comments/$', ProjectCommentConsumer.as_asgi()),
    
    # 3. НОВЫЙ РОУТ: Студийные чаты (заменил старый форум)
    re_path(r'^ws/chat/(?P<channel_id>\w+)/$', ChatConsumer.as_asgi()),
]