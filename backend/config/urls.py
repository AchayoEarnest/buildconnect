from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.profiles.urls')),
    path('api/', include('apps.projects.urls')),
    path('api/', include('apps.messaging.urls')),
    path('api/', include('apps.reviews.urls')),
    path('api/', include('apps.payments.urls')),
    path('api/', include('apps.notifications.urls')),
    path('api/', include('apps.search.urls')),
    path('api/', include('apps.analytics.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns
