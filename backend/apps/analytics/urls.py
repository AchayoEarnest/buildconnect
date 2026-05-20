from django.urls import path
from .views import EngineerAnalyticsView, ClientAnalyticsView, AdminAnalyticsView

urlpatterns = [
    path('analytics/engineer/', EngineerAnalyticsView.as_view()),
    # FIX: was missing — clients got 403 hitting the engineer endpoint
    path('analytics/client/', ClientAnalyticsView.as_view()),
    path('analytics/admin/', AdminAnalyticsView.as_view()),
]
