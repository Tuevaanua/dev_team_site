from django.db import models
from django.conf import settings

class ChatChannel(models.Model):
    """ Тематический чат-канал """
    name = models.CharField(max_length=100, unique=True, verbose_name="Название чата")
    description = models.CharField(max_length=255, blank=True, verbose_name="Тема/Описание чата")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок вывода")
    
    # Если True, писать и читать могут только разработчики студии
    is_private = models.BooleanField(default=False, verbose_name="Только для команды")

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"# {self.name}"


class ChatMessage(models.Model):
    """ Сообщение в чате """
    channel = models.ForeignKey(ChatChannel, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    content = models.TextField(verbose_name="Текст сообщения")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at'] # Важно: старые сверху, новые снизу (как в любом чате)

    def __str__(self):
        return f"{self.author.nickname} в #{self.channel.name}"