from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """ Базовый пользователь (может быть и просто зрителем/клиентом) """
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, verbose_name="Аватар")
    nickname = models.CharField(max_length=50, unique=True, verbose_name="Никнейм")
    is_developer = models.BooleanField(default=False, verbose_name="Член студии (Разработчик)")

    def __str__(self):
        return self.nickname or self.username


class DeveloperProfile(models.Model):
    """ Развернутое резюме/визитка члена команды """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='developer_profile')
    role = models.CharField(max_length=100, verbose_name="Должность/Роль", help_text="Например: Senior 3D Artist, Frontend Developer")
    bio = models.TextField(blank=True, verbose_name="Биография и Опыт")
    skills = models.CharField(max_length=500, blank=True, verbose_name="Стек и Навыки")
    portfolio_link = models.URLField(blank=True, null=True, verbose_name="Ссылка на внешнее портфолио (GitHub/ArtStation)")

    def __str__(self):
        return f"{self.user.nickname} - {self.role}"


class Notification(models.Model):
    """ Уведомления с поддержкой прямых ссылок (Target URL) """
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField(verbose_name="Текст сообщения")
    target_url = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ссылка для перехода (клику)")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Уведомление для {self.recipient.nickname}"