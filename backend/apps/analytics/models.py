from django.db import models
from apps.users.models import User
from apps.profiles.models import EngineerProfile


class ProfileView(models.Model):
    engineer  = models.ForeignKey(EngineerProfile, on_delete=models.CASCADE, related_name='view_logs')
    viewer    = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    viewer_ip = models.GenericIPAddressField(null=True, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'profile_views'
        indexes  = [models.Index(fields=['engineer', 'viewed_at'])]
