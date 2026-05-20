from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F
from django.shortcuts import get_object_or_404
from .models import EngineerProfile, PortfolioProject, SavedEngineer, ClientProfile
from .serializers import (
    EngineerProfileListSerializer, EngineerProfileDetailSerializer,
    PortfolioProjectSerializer, ClientProfileSerializer,
)
from .filters import EngineerFilter
from core.permissions import IsEngineer, IsClient


class EngineerListView(generics.ListAPIView):
    serializer_class   = EngineerProfileListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    # FIX: SearchFilter was missing — ?search= was silently ignored
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class    = EngineerFilter
    search_fields      = ['user__first_name', 'user__last_name', 'title',
                          'specialization', 'bio', 'skills__name', 'location_city']
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
        EngineerProfile.objects.filter(pk=instance.pk).update(profile_views=F('profile_views') + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BookmarkEngineerView(APIView):
    permission_classes = [IsAuthenticated, IsClient]

    def post(self, request, slug):
        engineer = get_object_or_404(EngineerProfile, slug=slug)
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


# ─── FIX: Both setup endpoints were missing — onboarding page posts here ───

class EngineerSetupView(APIView):
    """
    POST /api/profiles/engineer/setup/
    Creates or updates the engineer's profile after registration.
    """
    permission_classes = [IsAuthenticated, IsEngineer]

    def post(self, request):
        data = request.data
        try:
            profile = request.user.engineer_profile
        except EngineerProfile.DoesNotExist:
            profile = EngineerProfile(user=request.user)

        updatable = [
            'title', 'specialization', 'bio', 'years_exp',
            'hourly_rate', 'location_city', 'location_country',
        ]
        for field in updatable:
            if field in data:
                setattr(profile, field, data[field])

        # Derive slug from name if not set
        if not profile.slug:
            from django.utils.text import slugify
            import uuid as _uuid
            base = slugify(f"{request.user.first_name}-{request.user.last_name}")
            profile.slug = f"{base}-{str(_uuid.uuid4())[:8]}"

        profile.save()

        # Attach skills (list of skill name strings)
        if 'skills' in data:
            from .models import Skill
            skill_objs = []
            for name in data['skills']:
                skill, _ = Skill.objects.get_or_create(name=name)
                skill_objs.append(skill)
            profile.skills.set(skill_objs)

        return Response(
            EngineerProfileDetailSerializer(profile, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )


class ClientSetupView(APIView):
    """
    POST /api/profiles/client/setup/
    Creates or updates the client's profile after registration.
    """
    permission_classes = [IsAuthenticated, IsClient]

    def post(self, request):
        data = request.data
        try:
            profile = request.user.client_profile
        except ClientProfile.DoesNotExist:
            profile = ClientProfile(user=request.user)

        updatable = ['company_name', 'industry', 'location', 'website', 'bio']
        for field in updatable:
            if field in data:
                setattr(profile, field, data[field])

        profile.save()
        return Response(
            ClientProfileSerializer(profile).data,
            status=status.HTTP_200_OK,
        )
