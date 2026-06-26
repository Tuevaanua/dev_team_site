from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import ChatMessage
from .serializers import ChatMessageSerializer

@receiver(post_save, sender=ChatMessage)
def broadcast_new_message(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        # Создаем уникальную группу для каждого канала
        group_name = f"chat_{instance.channel.id}"
        serializer = ChatMessageSerializer(instance)
        async_to_sync(channel_layer.group_send)(
            group_name,
            {"type": "chat_message", "message": serializer.data}
        )