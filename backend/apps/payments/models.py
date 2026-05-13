from django.db import models
from apps.projects.models import Milestone


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('held', 'Held in Escrow'),
        ('released', 'Released'),
        ('refunded', 'Refunded'),
        ('failed', 'Failed'),
    ]
    milestone      = models.OneToOneField(Milestone, on_delete=models.CASCADE, related_name='payment')
    stripe_session = models.CharField(max_length=255, blank=True)
    stripe_intent  = models.CharField(max_length=255, blank=True)
    amount         = models.DecimalField(max_digits=12, decimal_places=2)
    platform_fee   = models.DecimalField(max_digits=10, decimal_places=2)
    net_amount     = models.DecimalField(max_digits=12, decimal_places=2)
    currency       = models.CharField(max_length=3, default='USD')
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        indexes  = [models.Index(fields=['status', 'created_at'])]
