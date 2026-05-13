from django.db import models
from apps.users.models import User
from apps.projects.models import Project


class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name='conversations')
    project      = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'conversations'

    def __str__(self):
        return f'Conversation {self.id}'


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender       = models.ForeignKey(User, on_delete=models.CASCADE)
    content      = models.TextField(blank=True)
    file_url     = models.URLField(blank=True)
    file_type    = models.CharField(max_length=50, blank=True)
    file_name    = models.CharField(max_length=255, blank=True)
    is_read      = models.BooleanField(default=False)
    sent_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        indexes  = [models.Index(fields=['conversation', 'sent_at'])]
        ordering = ['sent_at']
