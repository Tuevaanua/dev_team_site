from django.contrib import admin
from .models import ChatChannel, ChatMessage

@admin.register(ChatChannel)
class ChatChannelAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'is_private')
    list_filter = ('is_private',)
    search_fields = ('name', 'description')
    ordering = ('order',)

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('channel', 'author', 'short_content', 'created_at')
    list_filter = ('channel', 'created_at')
    search_fields = ('content', 'author__nickname')

    def short_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    short_content.short_description = 'Текст сообщения'