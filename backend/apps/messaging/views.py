from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, SendMessageSerializer


class ConversationListView(generics.ListAPIView):
    serializer_class   = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages').order_by('-created_at')


# FIX 1: Was missing entirely — frontend calls GET /conversations/{id}/
class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class   = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(
            Conversation.objects.prefetch_related('participants', 'messages'),
            id=self.kwargs['conversation_id'],
            participants=self.request.user,
        )


class ConversationMessagesView(generics.ListAPIView):
    serializer_class   = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(
            conversation_id=self.kwargs['conversation_id'],
            conversation__participants=self.request.user
        ).select_related('sender').order_by('sent_at')


# FIX 2: Was missing entirely — frontend calls POST /conversations/{id}/messages/
class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        conversation = get_object_or_404(
            Conversation, id=conversation_id, participants=request.user
        )
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file      = request.FILES.get('file')
        file_url  = None
        file_type = None
        file_name = None

        if file:
            from core.storage import upload_file
            try:
                file_url  = upload_file(file)
                file_type = file.content_type
                file_name = file.name
            except Exception:
                pass  # storage optional in dev

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=serializer.validated_data.get('content', ''),
            file_url=file_url,
            file_type=file_type,
            file_name=file_name,
        )
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


# FIX 3: Was missing entirely — frontend calls POST /conversations/{id}/mark-read/
class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        get_object_or_404(Conversation, id=conversation_id, participants=request.user)
        Message.objects.filter(
            conversation_id=conversation_id,
            is_read=False,
        ).exclude(sender=request.user).update(is_read=True)
        return Response({'detail': 'Marked as read.'})


class StartConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        participant_id = request.data.get('participant_id')
        # FIX 4: frontend sends key 'project', not 'project_id'
        project_id     = request.data.get('project') or request.data.get('project_id')

        from apps.users.models import User
        try:
            other_user = User.objects.get(id=participant_id)
        except (User.DoesNotExist, Exception):
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        existing = Conversation.objects.filter(participants=request.user).filter(
            participants=other_user)
        if project_id:
            existing = existing.filter(project_id=project_id)
        if existing.exists():
            conv = existing.first()
        else:
            conv = Conversation.objects.create(project_id=project_id)
            conv.participants.add(request.user, other_user)

        return Response(
            ConversationSerializer(conv, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
