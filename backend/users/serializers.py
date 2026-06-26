from rest_framework import serializers
from .models import User, DeveloperProfile, Notification

class DeveloperProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeveloperProfile
        # Добавили новые поля нашей визитки
        fields = ['role', 'bio', 'skills', 'portfolio_link']


class UserSerializer(serializers.ModelSerializer):
    """ Основной сериализатор для вывода данных пользователя """
    developer_profile = DeveloperProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'nickname', 'avatar', 'is_developer', 'developer_profile']
        # Флаг разработчика нельзя изменить через API напрямую (только админ)
        read_only_fields = ['is_developer']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """ Сериализатор исключительно для регистрации (создания) пользователя """
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'password', 'nickname', 'email']

    def create(self, validated_data):
        # Обязательно используем create_user для корректного хэширования пароля
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            nickname=validated_data['nickname'],
            email=validated_data.get('email', '')
        )
        return user


class NotificationSerializer(serializers.ModelSerializer):
    """ Сериализатор для истории уведомлений """
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    developer_profile = DeveloperProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'nickname', 'avatar', 'is_developer', 'developer_profile']
        read_only_fields = ['username', 'is_developer']

    def update(self, instance, validated_data):
        # Вытаскиваем данные профиля разработчика из запроса
        profile_data = validated_data.pop('developer_profile', None)

        # 1. Обновляем базовые поля пользователя
        instance.nickname = validated_data.get('nickname', instance.nickname)
        instance.email = validated_data.get('email', instance.email)
        
        if 'avatar' in validated_data:
            instance.avatar = validated_data.get('avatar')
            
        instance.save()

        # 2. Если юзер - разработчик и пришли данные профиля, обновляем их
        if profile_data and instance.is_developer and hasattr(instance, 'developer_profile'):
            profile = instance.developer_profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance