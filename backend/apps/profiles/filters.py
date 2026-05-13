import django_filters
from django.db.models import Q
from .models import EngineerProfile


class EngineerFilter(django_filters.FilterSet):
    specialization = django_filters.CharFilter(lookup_expr='iexact')
    min_rate       = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='gte')
    max_rate       = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='lte')
    min_rating     = django_filters.NumberFilter(field_name='avg_rating', lookup_expr='gte')
    min_exp        = django_filters.NumberFilter(field_name='years_exp', lookup_expr='gte')
    availability   = django_filters.CharFilter(lookup_expr='iexact')
    location       = django_filters.CharFilter(method='filter_location')
    skill          = django_filters.CharFilter(method='filter_skill')
    is_verified    = django_filters.BooleanFilter()

    class Meta:
        model  = EngineerProfile
        fields = ['specialization', 'availability', 'is_verified']

    def filter_location(self, queryset, name, value):
        return queryset.filter(
            Q(location_city__icontains=value) | Q(location_country__icontains=value)
        )

    def filter_skill(self, queryset, name, value):
        return queryset.filter(skills__name__icontains=value)
