from django.db import models
from apps.users.models import User


class Notification(models.Model):
    TYPE_CHOICES = [
        ('bid_received', 'Bid Received'),
        ('bid_accepted', 'Bid Accepted'),
        ('bid_rejected', 'Bid Rejected'),
        ('message', 'New Message'),
        ('review', 'New Review'),
        ('payment', 'Payment'),
        ('verification', 'Verification Update'),
    ]
    recipient  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notif_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title      = models.CharField(max_length=255)
    body       = models.TextField()
    link       = models.CharField(max_length=500, blank=True)
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        indexes  = [models.Index(fields=['recipient', 'is_read', 'created_at'])]
        ordering = ['-created_at']
