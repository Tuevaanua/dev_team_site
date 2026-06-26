from rest_framework import serializers
from .models import Project, ProjectImage, Update, Comment, CommercialRequest

class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'caption']

class UpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Update
        fields = ['id', 'project', 'title', 'content', 'image', 'created_at'] # ДОБАВИЛИ image

class CommentSerializer(serializers.ModelSerializer):
    author_nickname = serializers.CharField(source='author.nickname', read_only=True)
    author_avatar = serializers.ImageField(source='author.avatar', read_only=True)
    author_is_developer = serializers.BooleanField(source='author.is_developer', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'project', 'author', 'author_nickname', 'author_avatar', 'author_is_developer', 'text', 'created_at']
        read_only_fields = ['author']

class CommercialRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommercialRequest
        fields = '__all__'
        read_only_fields = ['user', 'status']

class ProjectListSerializer(serializers.ModelSerializer):
    comments_count = serializers.IntegerField(read_only=True)
    # <-- ИСПРАВЛЕНИЕ: Добавляем разработчиков в список, чтобы фронтенд мог их отфильтровать
    developers_info = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'short_description', 'cover', 'created_at', 'comments_count', 'developers_info']

    def get_developers_info(self, obj):
        return [{
            "id": dev.user.id, 
            "profile_id": dev.id,
            "nickname": dev.user.nickname, 
            "role": dev.role, 
            "avatar": dev.user.avatar.url if dev.user.avatar else None
        } for dev in obj.developers.all()]

class ProjectDetailSerializer(serializers.ModelSerializer):
    gallery = ProjectImageSerializer(many=True, read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    # Выводим красивый массив разработчиков проекта
    developers_info = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'short_description', 'description', 'cover', 
            'developers_info', 'gallery', 'created_at', 'comments_count'
        ]

    def get_developers_info(self, obj):
        return [{
            "id": dev.user.id, 
            "nickname": dev.user.nickname, 
            "role": dev.role, 
            "avatar": dev.user.avatar.url if dev.user.avatar else None
        } for dev in obj.developers.all()]

class ProjectWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'short_description', 'description', 'cover', 'developers']