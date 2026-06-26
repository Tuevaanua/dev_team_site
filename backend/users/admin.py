from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, DeveloperProfile, Notification

class DeveloperProfileInline(admin.StackedInline):
    model = DeveloperProfile
    can_delete = False
    verbose_name_plural = 'Профиль разработчика (Визитка)'

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    inlines = (DeveloperProfileInline,)
    list_display = ('username', 'nickname', 'email', 'is_developer', 'is_staff')
    list_filter = ('is_developer', 'is_staff', 'is_active')
    search_fields = ('username', 'nickname', 'email')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительная информация', {
            'fields': ('avatar', 'nickname', 'is_developer')
        }),
    )

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'short_message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('recipient__nickname', 'recipient__username', 'message')

    def short_message(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    short_message.short_description = 'Сообщение'