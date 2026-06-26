from rest_framework import viewsets, permissions, filters
from django.db.models import Count
from .models import Project, Update, Comment, CommercialRequest
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer, 
    UpdateSerializer, CommentSerializer, CommercialRequestSerializer,
    ProjectWriteSerializer
)
from rest_framework.throttling import ScopedRateThrottle

class ProjectViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'short_description', 'description']
    ordering_fields = ['created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()] # Только администраторы/персонал могут управлять проектами

    def get_serializer_class(self):
        # Используем новый сериализатор для создания/редактирования
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectWriteSerializer
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectDetailSerializer

    def get_queryset(self):
        return Project.objects.prefetch_related('developers__user', 'gallery').annotate(
            comments_count=Count('comments', distinct=True)
        ).order_by('-created_at')

class UpdateViewSet(viewsets.ModelViewSet):
    serializer_class = UpdateSerializer
    
    def get_permissions(self):
        """ Разрешаем всем читать патчноуты, но создавать могут только авторизованные """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
        
    def get_queryset(self):
        qs = Update.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    
    throttle_scope = 'project_comments' # <-- Привязали лимит

    def get_throttles(self):
        # Защищаем только отправку спама, читают все безлимитно
        if self.action == 'create':
            from rest_framework.throttling import ScopedRateThrottle
            return [ScopedRateThrottle()]
        return []

    def get_permissions(self):
        """ Разрешаем всем читать комментарии, но писать могут только авторизованные """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
        
    def get_queryset(self):
        qs = Comment.objects.select_related('author').all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommercialRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = CommercialRequestSerializer
    throttle_classes = [ScopedRateThrottle]     # <-- ВКЛЮЧАЕМ ЗАЩИТУ
    throttle_scope = 'commercial_req' # Привязка к лимиту в settings.py

    def get_throttles(self):
        # Включаем жесткий антиспам ТОЛЬКО для создания новых заявок клиентами
        if self.action == 'create':
            throttle_classes = [ScopedRateThrottle]
        else:
            throttle_classes = [] # Админы читают и редактируют без лимитов
        return [throttle() for throttle in throttle_classes]
    def get_queryset(self):
        # Разработчики видят все заявки
        if self.request.user.is_staff or self.request.user.is_developer:
            return CommercialRequest.objects.all()
        # Обычный юзер видит только свои (если авторизован)
        if self.request.user.is_authenticated:
            return CommercialRequest.objects.filter(user=self.request.user)
        return CommercialRequest.objects.none()

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()