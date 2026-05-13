from django.db import models
from apps.profiles.models import EngineerProfile, ClientProfile


class Project(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    client      = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='projects')
    title       = models.CharField(max_length=300)
    description = models.TextField()
    skills_req  = models.JSONField(default=list)
    budget_min  = models.DecimalField(max_digits=12, decimal_places=2)
    budget_max  = models.DecimalField(max_digits=12, decimal_places=2)
    deadline    = models.DateField()
    location    = models.CharField(max_length=200, blank=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'projects'
        indexes  = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['client']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Bid(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    project      = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='bids')
    engineer     = models.ForeignKey(EngineerProfile, on_delete=models.CASCADE, related_name='bids')
    amount       = models.DecimalField(max_digits=12, decimal_places=2)
    cover_letter = models.TextField()
    timeline     = models.PositiveIntegerField(help_text='Days to complete')
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table        = 'bids'
        unique_together = ('project', 'engineer')
        indexes         = [models.Index(fields=['project', 'status'])]


class Milestone(models.Model):
    project     = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    engineer    = models.ForeignKey(EngineerProfile, on_delete=models.CASCADE)
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    amount      = models.DecimalField(max_digits=12, decimal_places=2)
    due_date    = models.DateField()
    is_released = models.BooleanField(default=False)
    released_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'milestones'
        ordering = ['due_date']
