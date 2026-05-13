from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
from apps.payments.models import Payment
from apps.projects.models import Project, Bid
from apps.users.models import User
from .models import ProfileView
from core.permissions import IsEngineer


class EngineerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsEngineer]

    def get(self, request):
        engineer = request.user.engineer_profile
        now      = timezone.now()
        last_30  = now - timedelta(days=30)

        profile_views = ProfileView.objects.filter(engineer=engineer, viewed_at__gte=last_30).count()

        earnings = Payment.objects.filter(
            milestone__engineer=engineer, status='released'
        ).aggregate(total=Sum('net_amount'), count=Count('id'))

        bids = Bid.objects.filter(engineer=engineer)
        bid_stats = {
            'total':    bids.count(),
            'accepted': bids.filter(status='accepted').count(),
            'pending':  bids.filter(status='pending').count(),
        }

        return Response({
            'profile_views_30d': profile_views,
            'total_earnings':    earnings['total'] or 0,
            'completed_projects': earnings['count'],
            'bid_stats':         bid_stats,
            'avg_rating':        float(engineer.avg_rating),
        })


class AdminAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        now     = timezone.now()
        last_30 = now - timedelta(days=30)

        return Response({
            'total_users':     User.objects.count(),
            'engineers':       User.objects.filter(role='engineer').count(),
            'clients':         User.objects.filter(role='client').count(),
            'new_users_30d':   User.objects.filter(date_joined__gte=last_30).count(),
            'total_projects':  Project.objects.count(),
            'active_projects': Project.objects.filter(status__in=['open', 'in_progress']).count(),
            'total_revenue':   Payment.objects.filter(status='released').aggregate(
                                   t=Sum('platform_fee'))['t'] or 0,
            'revenue_30d':     Payment.objects.filter(
                                   status='released', updated_at__gte=last_30
                               ).aggregate(t=Sum('platform_fee'))['t'] or 0,
        })
