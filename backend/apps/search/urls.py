from django.urls import path
from .views import EngineerSearchView, ProjectSearchView

urlpatterns = [
    path('search/engineers/', EngineerSearchView.as_view()),
    path('search/projects/', ProjectSearchView.as_view()),
]
