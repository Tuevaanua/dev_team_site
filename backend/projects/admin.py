from django.contrib import admin
from .models import Project, ProjectImage, Update, Comment, CommercialRequest

class ProjectImageInline(admin.TabularInline):
    """ Позволяет загружать несколько скриншотов прямо внутри проекта """
    model = ProjectImage
    extra = 1

class UpdateInline(admin.TabularInline):
    """ Добавление патчноутов внутри проекта """
    model = Update
    extra = 1

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title', 'short_description')
    inlines = [ProjectImageInline, UpdateInline]
    filter_horizontal = ('developers',) # Удобный UI для добавления участников
    list_filter = ('created_at',)

@admin.register(CommercialRequest)
class CommercialRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'request_type', 'status', 'created_at')
    list_filter = ('status', 'request_type', 'created_at')
    search_fields = ('name', 'contact_info', 'message')
    list_editable = ('status',) # Позволяет менять статус прямо из списка

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('project', 'author', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('text', 'author__nickname', 'project__title')