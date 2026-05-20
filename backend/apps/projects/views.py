from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from .models import Project, Bid, Milestone
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer,
    ProjectCreateSerializer, BidSerializer, BidCreateSerializer,
    BidWithProjectSerializer, MilestoneSerializer,
)
from core.permissions import IsClient, IsEngineer


class ProjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    # FIX: expose search capability
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['title', 'description', 'location', 'skills_req']
    ordering_fields    = ['created_at', 'budget_min', 'deadline']
    ordering           = ['-created_at']

    def get_serializer_class(self):
        return ProjectCreateSerializer if self.request.method == 'POST' else ProjectListSerializer

    def get_queryset(self):
        qs     = Project.objects.select_related('client__user').prefetch_related('bids')
        params = self.request.query_params

        # FIX: was hardcoded status='open'; now supports status + mine + all
        status_filter = params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        else:
            # Default: only show open projects to anonymous / engineer browsers
            # but clients see all their own projects regardless of status
            mine = params.get('mine') == 'true'
            if not mine:
                qs = qs.filter(status='open')

        # FIX: support ?mine=true — clients view their own projects
        if params.get('mine') == 'true' and self.request.user.is_authenticated:
            try:
                qs = qs.filter(client=self.request.user.client_profile)
            except Exception:
                qs = qs.none()

        return qs

    def perform_create(self, serializer):
        serializer.save(client=self.request.user.client_profile)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Project.objects.select_related('client__user').prefetch_related(
                             'bids__engineer__user', 'milestones')
    serializer_class   = ProjectDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class BidListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        return BidCreateSerializer if self.request.method == 'POST' else BidSerializer

    def get_queryset(self):
        return Bid.objects.filter(
            project_id=self.kwargs['project_id']
        ).select_related('engineer__user')

    def perform_create(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs['project_id'])
        serializer.save(project=project, engineer=self.request.user.engineer_profile)


class BidUpdateView(generics.UpdateAPIView):
    queryset           = Bid.objects.all()
    serializer_class   = BidSerializer
    permission_classes = [IsAuthenticated, IsClient]

    def partial_update(self, request, *args, **kwargs):
        bid        = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ('accepted', 'rejected'):
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        bid.status = new_status
        bid.save()
        if new_status == 'accepted':
            bid.project.status = 'in_progress'
            bid.project.save()
        return Response(BidSerializer(bid).data)


# FIX: was missing entirely — GET /bids/my/ (engineer's own bids with project info)
class MyBidsView(generics.ListAPIView):
    serializer_class   = BidWithProjectSerializer
    permission_classes = [IsAuthenticated, IsEngineer]
    filter_backends    = [filters.OrderingFilter]
    ordering           = ['-submitted_at']

    def get_queryset(self):
        qs = Bid.objects.filter(
            engineer=self.request.user.engineer_profile
        ).select_related('project__client__user', 'engineer__user')

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs
