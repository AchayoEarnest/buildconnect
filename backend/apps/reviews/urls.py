from django.urls import path
from .views import EngineerReviewListView, CreateReviewView

urlpatterns = [
    path('engineers/<slug:slug>/reviews/', EngineerReviewListView.as_view()),
    path('projects/<int:project_id>/review/', CreateReviewView.as_view()),
]
