import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.profiles.models import ClientProfile, EngineerProfile

User = get_user_model()


@pytest.fixture
def client_user(db):
    user = User.objects.create_user(
        email='client@test.com', password='pass123!',
        first_name='Client', last_name='User', role='client',
    )
    ClientProfile.objects.create(user=user, industry='Construction')
    return user


@pytest.fixture
def api_client(client_user):
    client = APIClient()
    client.force_authenticate(user=client_user)
    return client


@pytest.mark.django_db
class TestProjectAPI:
    def test_create_project(self, api_client):
        response = api_client.post('/api/projects/', {
            'title': 'Bridge Structural Analysis',
            'description': 'Need a structural engineer to analyze an old bridge.',
            'skills_req': ['Structural Analysis', 'AutoCAD'],
            'budget_min': 5000,
            'budget_max': 15000,
            'deadline': '2025-12-31',
            'location': 'Nairobi, Kenya',
        }, format='json')
        assert response.status_code == 201
        assert response.data['title'] == 'Bridge Structural Analysis'

    def test_list_open_projects(self, api_client):
        response = api_client.get('/api/projects/')
        assert response.status_code == 200
        assert 'results' in response.data
