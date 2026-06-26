from django.db import models
from django.conf import settings
from users.models import DeveloperProfile

class Project(models.Model):
    """ Студийный проект """
    title = models.CharField(max_length=200, verbose_name="Название проекта")
    short_description = models.CharField(max_length=255, verbose_name="Краткое описание (для карточки)")
    description = models.TextField(verbose_name="Развернутое описание")
    cover = models.ImageField(upload_to='projects/covers/', null=True, blank=True, verbose_name="Главная обложка")
    
    # Теперь над проектом работает конкретный список людей из студии
    developers = models.ManyToManyField(DeveloperProfile, related_name='projects', verbose_name="Участники проекта")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ProjectImage(models.Model):
    """ Галерея скриншотов проекта (One-to-Many) """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='gallery', verbose_name="Проект")
    image = models.ImageField(upload_to='projects/gallery/', verbose_name="Изображение")
    caption = models.CharField(max_length=150, blank=True, verbose_name="Подпись (опционально)")

    def __str__(self):
        return f"Скриншот для {self.project.title}"


class Update(models.Model):
    """ Хронология патчноутов/дневников разработки """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='updates_images/', blank=True, null=True) # НОВОЕ ПОЛЕ
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Comment(models.Model):
    """ Отзывы пользователей к проектам """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField(verbose_name="Текст")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class CommercialRequest(models.Model):
    """ Коммерческие заявки администратору студии """
    REQUEST_TYPES = [
        ('order', 'Заказ разработки'),
        ('collab', 'Сотрудничество'),
        ('ad', 'Реклама/PR'),
        ('other', 'Другое'),
    ]
    
    name = models.CharField(max_length=100, verbose_name="Имя/Компания")
    contact_info = models.CharField(max_length=255, verbose_name="Контакты (Email, Telegram)")
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES, verbose_name="Тип заявки")
    message = models.TextField(verbose_name="Суть предложения")
    
    # Опционально, если заявка отправлена авторизованным юзером
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=[('new', 'Новая'), ('in_progress', 'В работе'), ('closed', 'Закрыта')], default='new')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']