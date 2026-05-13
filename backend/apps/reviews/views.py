from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer
from apps.projects.models import Project
from apps.profiles.models import EngineerProfile
from core.permissions import IsClient


class EngineerReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        return Review.objects.filter(
            engineer__slug=self.kwargs['slug'], is_approved=True
        ).select_related('client__user').order_by('-created_at')


class CreateReviewView(generics.CreateAPIView):
    serializer_class   = ReviewCreateSerializer
    permission_classes = [IsAuthenticated, IsClient]

    def create(self, request, *args, **kwargs):
        project  = get_object_or_404(Project, id=kwargs['project_id'], status='completed')
        engineer = get_object_or_404(EngineerProfile, bids__project=project, bids__status='accepted')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(project=project, client=request.user.client_profile, engineer=engineer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
