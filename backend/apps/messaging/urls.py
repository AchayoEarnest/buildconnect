from django.urls import path
from .views import ConversationListView, ConversationMessagesView, StartConversationView

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:conversation_id>/messages/', ConversationMessagesView.as_view()),
    path('conversations/start/', StartConversationView.as_view(), name='start-conversation'),
]
