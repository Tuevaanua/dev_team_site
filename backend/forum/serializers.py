from rest_framework import serializers
from .models import ChatChannel, ChatMessage

class ChatChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatChannel
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    author_nickname = serializers.CharField(source='author.nickname', read_only=True)
    author_avatar = serializers.ImageField(source='author.avatar', read_only=True)
    author_is_developer = serializers.BooleanField(source='author.is_developer', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'channel', 'author', 'author_nickname', 'author_avatar', 'author_is_developer', 'content', 'created_at']
        read_only_fields = ['author']