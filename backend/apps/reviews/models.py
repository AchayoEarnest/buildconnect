from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.projects.models import Project
from apps.profiles.models import EngineerProfile, ClientProfile


class Review(models.Model):
    project     = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='review')
    client      = models.ForeignKey(ClientProfile, on_delete=models.CASCADE)
    engineer    = models.ForeignKey(EngineerProfile, on_delete=models.CASCADE, related_name='reviews')
    rating      = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment     = models.TextField()
    is_approved = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        indexes  = [models.Index(fields=['engineer', 'is_approved'])]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self._update_engineer_rating()

    def _update_engineer_rating(self):
        from django.db.models import Avg
        result = Review.objects.filter(
            engineer=self.engineer, is_approved=True
        ).aggregate(avg=Avg('rating'), count=models.Count('id'))
        EngineerProfile.objects.filter(pk=self.engineer.pk).update(
            avg_rating=result['avg'] or 0,
            review_count=result['count'],
        )
