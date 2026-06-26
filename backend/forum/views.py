from rest_framework import viewsets, permissions
from .models import ChatChannel, ChatMessage
from .serializers import ChatChannelSerializer, ChatMessageSerializer

class ChatChannelViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatChannelSerializer
    queryset = ChatChannel.objects.all()
    throttle_scope = 'chat_messages' # Привязываем лимит

    def get_throttles(self):
        # Ограничиваем только отправку новых сообщений, чтение истории безлимитно
        if self.action == 'create':
            return [ScopedRateThrottle()]
        return []
class ChatMessageViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        qs = ChatMessage.objects.select_related('author').all()
        channel_id = self.request.query_params.get('channel')
        if channel_id:
            qs = qs.filter(channel_id=channel_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)