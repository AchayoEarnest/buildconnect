from django.urls import path
from .views import (
    EngineerListView, EngineerDetailView,
    BookmarkEngineerView, PortfolioView,
    EngineerSetupView, ClientSetupView,
)

urlpatterns = [
    path('engineers/', EngineerListView.as_view(), name='engineer-list'),
    path('engineers/<slug:slug>/', EngineerDetailView.as_view(), name='engineer-detail'),
    path('engineers/<slug:slug>/bookmark/', BookmarkEngineerView.as_view(), name='bookmark-engineer'),
    path('portfolio/', PortfolioView.as_view(), name='portfolio'),

    # FIX: both were missing — onboarding page posts here
    path('profiles/engineer/setup/', EngineerSetupView.as_view(), name='engineer-setup'),
    path('profiles/client/setup/', ClientSetupView.as_view(), name='client-setup'),
]
