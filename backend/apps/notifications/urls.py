from django.urls import path
from .views import NotificationListView, MarkReadView

urlpatterns = [
    path('notifications/', NotificationListView.as_view()),
    path('notifications/mark-read/', MarkReadView.as_view()),
]
