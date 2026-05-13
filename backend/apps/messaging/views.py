from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationListView(generics.ListAPIView):
    serializer_class   = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages').order_by('-created_at')


class ConversationMessagesView(generics.ListAPIView):
    serializer_class   = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(
            conversation_id=self.kwargs['conversation_id'],
            conversation__participants=self.request.user
        ).select_related('sender').order_by('sent_at')


class StartConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        participant_id = request.data.get('participant_id')
        project_id     = request.data.get('project_id')
        from apps.users.models import User
        try:
            other_user = User.objects.get(id=participant_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Find existing or create new
        existing = Conversation.objects.filter(participants=request.user).filter(
            participants=other_user)
        if project_id:
            existing = existing.filter(project_id=project_id)
        if existing.exists():
            conv = existing.first()
        else:
            conv = Conversation.objects.create(project_id=project_id)
            conv.participants.add(request.user, other_user)

        return Response(ConversationSerializer(conv, context={'request': request}).data,
                        status=status.HTTP_201_CREATED)
