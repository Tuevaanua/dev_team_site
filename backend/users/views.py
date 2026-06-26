from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, DeveloperProfile, Notification
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    DeveloperProfileSerializer, 
    NotificationSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """ Разрешаем всем посетителям видеть профили команды студии """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer

    # Удобный эндпоинт /api/v1/users/me/ для фронтенда
    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            # Обновление базовой информации (аватар, никнейм)
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    # Эндпоинт для обновления данных профиля разработчика /api/v1/users/me/developer/
    @action(detail=False, methods=['patch'], url_path='me/developer')
    def update_developer_profile(self, request):
        if not request.user.is_developer:
            return Response(
                {"detail": "Вы не являетесь разработчиком."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile, created = DeveloperProfile.objects.get_or_create(user=request.user)
        serializer = DeveloperProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Возвращаем обновленного юзера целиком для удобства фронта
        return Response(UserSerializer(request.user).data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ Просмотр своих уведомлений и отметка об их прочтении """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # Пользователь видит ТОЛЬКО свои уведомления
        return Notification.objects.filter(recipient=self.request.user)

    # Эндпоинт /api/v1/notifications/{id}/mark_read/
    @action(detail=True, methods=['post'], url_path='mark_read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'status': 'Уведомление прочитано'})