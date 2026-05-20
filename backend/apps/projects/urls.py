from django.urls import path
from .views import (
    ProjectListCreateView, ProjectDetailView,
    BidListCreateView, BidUpdateView,
    MyBidsView,
)

urlpatterns = [
    path('projects/', ProjectListCreateView.as_view(), name='project-list'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<int:project_id>/bids/', BidListCreateView.as_view(), name='bid-list'),
    path('bids/<int:pk>/', BidUpdateView.as_view(), name='bid-update'),
    # FIX: was missing entirely — engineer's own bid history
    path('bids/my/', MyBidsView.as_view(), name='my-bids'),
]
