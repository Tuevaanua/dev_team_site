from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

# --- ИМПОРТЫ ДЛЯ SWAGGER ---
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

# Импорты новых ViewSets
from users.views import UserViewSet, NotificationViewSet
from forum.views import ChatChannelViewSet, ChatMessageViewSet
from projects.views import ProjectViewSet, UpdateViewSet, CommentViewSet, CommercialRequestViewSet

router = DefaultRouter()

# Пользователи
router.register(r'users', UserViewSet, basename='user')
router.register(r'notifications', NotificationViewSet, basename='notification')

# Чаты (вместо старого форума)
router.register(r'forum/channels', ChatChannelViewSet, basename='channel')
router.register(r'forum/messages', ChatMessageViewSet, basename='message')

# Проекты
router.register(r'projects/projects', ProjectViewSet, basename='project')
router.register(r'projects/updates', UpdateViewSet, basename='update')
router.register(r'projects/comments', CommentViewSet, basename='comment')
router.register(r'projects/requests', CommercialRequestViewSet, basename='request') # Коммерческие заявки

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # JWT Токены
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Подключение всех эндпоинтов из роутера
    path('api/v1/', include(router.urls)),

    # --- ДОКУМЕНТАЦИЯ API (SWAGGER & REDOC) ---
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'), # Генерация сырого JSON
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'), # Интерактивный UI
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'), # Строгий текстовый UI
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)