from django.urls import path
from .views import (
    ConversationListView,
    ConversationDetailView,
    ConversationMessagesView,
    SendMessageView,
    MarkReadView,
    StartConversationView,
)

urlpatterns = [
    # List all conversations for current user
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),

    # FIX: was missing — GET single conversation (frontend: messagesApi.getConversation)
    path('conversations/<int:conversation_id>/', ConversationDetailView.as_view(), name='conversation-detail'),

    # GET messages in a conversation
    path('conversations/<int:conversation_id>/messages/', ConversationMessagesView.as_view(), name='conversation-messages'),

    # FIX: was missing — POST send a message (frontend: messagesApi.sendMessage)
    path('conversations/<int:conversation_id>/messages/send/', SendMessageView.as_view(), name='send-message'),

    # FIX: was missing — POST mark messages read (frontend: messagesApi.markRead)
    path('conversations/<int:conversation_id>/mark-read/', MarkReadView.as_view(), name='mark-read'),

    # FIX: startConversation was posting to /conversations/ — correct endpoint is /conversations/start/
    path('conversations/start/', StartConversationView.as_view(), name='start-conversation'),
]
