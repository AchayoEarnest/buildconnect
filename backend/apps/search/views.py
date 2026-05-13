from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from django.db.models import F
from apps.profiles.models import EngineerProfile
from apps.projects.models import Project
from apps.profiles.serializers import EngineerProfileListSerializer
from apps.projects.serializers import ProjectListSerializer
import math


class EngineerSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        q            = request.query_params.get('q', '')
        lat          = request.query_params.get('lat')
        lng          = request.query_params.get('lng')
        radius_km    = float(request.query_params.get('radius', 50))
        specialization = request.query_params.get('specialization', '')

        queryset = EngineerProfile.objects.filter(user__is_active=True).select_related('user').prefetch_related('skills')

        if q:
            search_query = SearchQuery(q)
            queryset = queryset.filter(search_vector=search_query).annotate(
                rank=SearchRank(F('search_vector'), search_query)
            ).order_by('-rank')

        if specialization:
            queryset = queryset.filter(specialization__iexact=specialization)

        # Geo filter (Haversine approximation)
        if lat and lng:
            lat, lng = float(lat), float(lng)
            # Bounding box pre-filter (1 deg lat ≈ 111km)
            delta = radius_km / 111.0
            queryset = queryset.filter(
                location_lat__range=(lat - delta, lat + delta),
                location_lng__range=(lng - delta, lng + delta),
            )

        serializer = EngineerProfileListSerializer(queryset[:50], many=True)
        return Response(serializer.data)


class ProjectSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '')
        queryset = Project.objects.filter(status='open').select_related('client')
        if q:
            queryset = queryset.filter(title__icontains=q) | queryset.filter(description__icontains=q)
        serializer = ProjectListSerializer(queryset[:50], many=True)
        return Response(serializer.data)
