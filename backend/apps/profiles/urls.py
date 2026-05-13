from django.urls import path
from .views import EngineerListView, EngineerDetailView, BookmarkEngineerView, PortfolioView

urlpatterns = [
    path('engineers/', EngineerListView.as_view(), name='engineer-list'),
    path('engineers/<slug:slug>/', EngineerDetailView.as_view(), name='engineer-detail'),
    path('engineers/<slug:slug>/bookmark/', BookmarkEngineerView.as_view(), name='bookmark-engineer'),
    path('portfolio/', PortfolioView.as_view(), name='portfolio'),
]
