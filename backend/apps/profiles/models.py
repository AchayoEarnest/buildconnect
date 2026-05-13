from django.db import models
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex
from apps.users.models import User


class EngineerProfile(models.Model):
    AVAILABILITY_CHOICES = [
        ('available', 'Available'),
        ('busy', 'Busy'),
        ('unavailable', 'Unavailable'),
    ]
    SPECIALIZATION_CHOICES = [
        ('civil', 'Civil Engineering'),
        ('structural', 'Structural Engineering'),
        ('mechanical', 'Mechanical Engineering'),
        ('electrical', 'Electrical Engineering'),
        ('quantity_surveyor', 'Quantity Surveying'),
        ('architect', 'Architecture'),
        ('geotechnical', 'Geotechnical Engineering'),
        ('environmental', 'Environmental Engineering'),
        ('project_manager', 'Project Management'),
        ('other', 'Other'),
    ]
    user           = models.OneToOneField(User, on_delete=models.CASCADE, related_name='engineer_profile')
    slug           = models.SlugField(unique=True, max_length=200)
    title          = models.CharField(max_length=200)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    bio            = models.TextField()
    years_exp      = models.PositiveSmallIntegerField(default=0)
    hourly_rate    = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    availability   = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='available')
    location_city  = models.CharField(max_length=100, blank=True)
    location_country = models.CharField(max_length=100, blank=True)
    location_lat   = models.FloatField(null=True, blank=True)
    location_lng   = models.FloatField(null=True, blank=True)
    avatar         = models.URLField(blank=True)
    linkedin_url   = models.URLField(blank=True)
    website_url    = models.URLField(blank=True)
    is_verified    = models.BooleanField(default=False)
    avg_rating     = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    review_count   = models.PositiveIntegerField(default=0)
    profile_views  = models.PositiveIntegerField(default=0)
    search_vector  = SearchVectorField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'engineer_profiles'
        indexes  = [
            GinIndex(fields=['search_vector']),
            models.Index(fields=['location_lat', 'location_lng']),
            models.Index(fields=['avg_rating']),
            models.Index(fields=['specialization']),
            models.Index(fields=['availability']),
        ]

    def __str__(self):
        return f'{self.user.full_name} — {self.specialization}'


class Skill(models.Model):
    engineer = models.ForeignKey(EngineerProfile, on_delete=models.CASCADE, related_name='skills')
    name     = models.CharField(max_length=100)

    class Meta:
        db_table        = 'skills'
        unique_together = ('engineer', 'name')


class Certification(models.Model):
    engineer  = models.ForeignKey(EngineerProfile, on_delete=models.CASCADE, related_name='certifications')
    name      = models.CharField(max_length=200)
    issuer    = models.CharField(max_length=200)
    issued_on = models.DateField()
    expires   = models.DateField(null=True, blank=True)
    document  = models.URLField(blank=True)

    class Meta:
        db_table = 'certifications'


class PortfolioProject(models.Model):
    engineer    = models.ForeignKey(EngineerProfile, on_delete=models.CASCADE, related_name='portfolio')
    title       = models.CharField(max_length=300)
    description = models.TextField()
    location    = models.CharField(max_length=200, blank=True)
    client_name = models.CharField(max_length=200, blank=True)
    value       = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    completed   = models.DateField()
    cover_image = models.URLField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'portfolio_projects'
        indexes  = [models.Index(fields=['engineer', 'completed'])]
        ordering = ['-completed']


class PortfolioMedia(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
    ]
    project    = models.ForeignKey(PortfolioProject, on_delete=models.CASCADE, related_name='media')
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPE_CHOICES)
    url        = models.URLField()
    caption    = models.CharField(max_length=300, blank=True)
    order      = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'portfolio_media'
        ordering = ['order']


class ClientProfile(models.Model):
    user         = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    company_name = models.CharField(max_length=200, blank=True)
    industry     = models.CharField(max_length=100, blank=True)
    location     = models.CharField(max_length=200, blank=True)
    website      = models.URLField(blank=True)
    avatar       = models.URLField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'client_profiles'


class SavedEngineer(models.Model):
    client   = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='saved_engineers')
    engineer = models.ForeignKey(EngineerProfile, on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'saved_engineers'
        unique_together = ('client', 'engineer')
