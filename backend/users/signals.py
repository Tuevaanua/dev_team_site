from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, DeveloperProfile
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import NotificationSerializer
from .models import Notification

from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification
from .serializers import NotificationSerializer

@receiver(post_save, sender=User)
def auto_create_developer_profile(sender, instance, **kwargs):
    """ 
    Автоматически создает DeveloperProfile, 
    если пользователь отмечен как разработчик.
    """
    if instance.is_developer:
        DeveloperProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=Notification)
def broadcast_notification(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        # Отправляем в персональную группу пользователя
        group_name = f"user_{instance.recipient.id}"
        serializer = NotificationSerializer(instance)
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "send_notification",
                "notification": serializer.data
            }
        )