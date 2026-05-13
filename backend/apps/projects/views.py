from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from .models import Project, Bid, Milestone
from .serializers import (ProjectListSerializer, ProjectDetailSerializer,
                           ProjectCreateSerializer, BidSerializer, BidCreateSerializer,
                           MilestoneSerializer)
from core.permissions import IsClient, IsEngineer


class ProjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        return ProjectCreateSerializer if self.request.method == 'POST' else ProjectListSerializer

    def get_queryset(self):
        return Project.objects.select_related('client').filter(status='open')

    def perform_create(self, serializer):
        serializer.save(client=self.request.user.client_profile)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Project.objects.select_related('client').prefetch_related('bids__engineer', 'milestones')
    serializer_class   = ProjectDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class BidListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        return BidCreateSerializer if self.request.method == 'POST' else BidSerializer

    def get_queryset(self):
        return Bid.objects.filter(project_id=self.kwargs['project_id']).select_related('engineer__user')

    def perform_create(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs['project_id'])
        serializer.save(project=project, engineer=self.request.user.engineer_profile)


class BidUpdateView(generics.UpdateAPIView):
    """Client accepts or rejects a bid."""
    queryset           = Bid.objects.all()
    serializer_class   = BidSerializer
    permission_classes = [IsAuthenticated, IsClient]

    def partial_update(self, request, *args, **kwargs):
        bid = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ('accepted', 'rejected'):
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        bid.status = new_status
        bid.save()
        if new_status == 'accepted':
            bid.project.status = 'in_progress'
            bid.project.save()
        return Response(BidSerializer(bid).data)
