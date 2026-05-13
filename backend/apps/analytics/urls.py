from django.urls import path
from .views import EngineerAnalyticsView, AdminAnalyticsView

urlpatterns = [
    path('analytics/engineer/', EngineerAnalyticsView.as_view()),
    path('analytics/admin/', AdminAnalyticsView.as_view()),
]
