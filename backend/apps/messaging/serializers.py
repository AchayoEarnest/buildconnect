from rest_framework import serializers
from .models import Conversation, Message
from apps.users.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model  = Message
        fields = ['id', 'sender', 'content', 'file_url', 'file_type', 'file_name', 'is_read', 'sent_at']


# FIX: Added — needed by SendMessageView
class SendMessageSerializer(serializers.Serializer):
    content = serializers.CharField(required=False, allow_blank=True, default='')


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model  = Conversation
        fields = ['id', 'participants', 'project', 'last_message', 'unread_count', 'created_at']

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return MessageSerializer(msg).data if msg else None

    def get_unread_count(self, obj):
        user = self.context.get('request') and self.context['request'].user
        if not user:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=user).count()
