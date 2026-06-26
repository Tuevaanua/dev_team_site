from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Comment
from .serializers import CommentSerializer
from users.models import Notification
import requests
from django.conf import settings
from .models import CommercialRequest

@receiver(post_save, sender=Comment)
def broadcast_new_comment(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        
        # 1. Отправляем в Live-чат
        group_name = f"project_comments_{instance.project.id}"
        serializer = CommentSerializer(instance)
        async_to_sync(channel_layer.group_send)(
            group_name,
            {"type": "new_comment", "comment": serializer.data}
        )

        # 2. Уведомляем ВСЕХ разработчиков проекта, кроме автора комментария
        for developer in instance.project.developers.all():
            project_owner = developer.user
            if instance.author != project_owner:
                Notification.objects.create(
                    recipient=project_owner,
                    message=f"{instance.author.nickname} оставил комментарий к проекту '{instance.project.title}'",
                    target_url=f"/projects/{instance.project.id}" # Прямая ссылка для перехода
                )

@receiver(post_save, sender=CommercialRequest)
def notify_telegram_new_request(sender, instance, created, **kwargs):
    """
    Интеграция с внешним сервисом (Telegram API).
    Отправляет уведомление админу при создании новой коммерческой заявки.
    """
    if created and hasattr(settings, 'TELEGRAM_BOT_TOKEN') and settings.TELEGRAM_BOT_TOKEN:
        # Словарик для перевода типов заявок на русский
        types_ru = {
            'order': 'Заказ разработки',
            'collab': 'Сотрудничество / Партнерство',
            'ad': 'Реклама / PR',
            'other': 'Другое'
        }
        req_type = types_ru.get(instance.request_type, instance.request_type)

        # Формируем красивое сообщение с Markdown
        message = (
            f"🚨 *Новая коммерческая заявка!*\n\n"
            f"👤 *От кого:* {instance.name}\n"
            f"📞 *Контакт:* {instance.contact_info}\n"
            f"🏷 *Тип:* {req_type}\n\n"
            f"📝 *Суть предложения:*\n{instance.message}"
        )
        
        # URL API Telegram
        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
        
        payload = {
            "chat_id": settings.TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "Markdown"
        }
        
        try:
            # Отправляем POST запрос к внешнему API
            requests.post(url, json=payload, timeout=5)
        except Exception as e:
            print(f"Ошибка интеграции с Telegram: {e}")