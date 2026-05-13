from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.text import slugify
from django.db.models import F
from .models import EngineerProfile, PortfolioProject, SavedEngineer, ClientProfile
from .serializers import (EngineerProfileListSerializer, EngineerProfileDetailSerializer,
                           PortfolioProjectSerializer, ClientProfileSerializer)
from .filters import EngineerFilter
from core.permissions import IsEngineer, IsClient


class EngineerListView(generics.ListAPIView):
    serializer_class   = EngineerProfileListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class    = EngineerFilter
    ordering_fields    = ['avg_rating', 'years_exp', 'hourly_rate', 'created_at']
    ordering           = ['-avg_rating']

    def get_queryset(self):
        return EngineerProfile.objects.select_related('user').prefetch_related('skills').filter(
            user__is_active=True
        )


class EngineerDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field       = 'slug'

    def get_serializer_class(self):
        return EngineerProfileDetailSerializer

    def get_queryset(self):
        return EngineerProfile.objects.select_related('user').prefetch_related(
            'skills', 'certifications', 'portfolio__media')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count asynchronously
        EngineerProfile.objects.filter(pk=instance.pk).update(profile_views=F('profile_views') + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BookmarkEngineerView(APIView):
    permission_classes = [IsAuthenticated, IsClient]

    def post(self, request, slug):
        engineer = EngineerProfile.objects.get(slug=slug)
        client   = request.user.client_profile
        obj, created = SavedEngineer.objects.get_or_create(client=client, engineer=engineer)
        if not created:
            obj.delete()
            return Response({'saved': False})
        return Response({'saved': True}, status=status.HTTP_201_CREATED)


class PortfolioView(generics.ListCreateAPIView):
    serializer_class   = PortfolioProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PortfolioProject.objects.filter(
            engineer=self.request.user.engineer_profile
        ).prefetch_related('media')

    def perform_create(self, serializer):
        serializer.save(engineer=self.request.user.engineer_profile)
