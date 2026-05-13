import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self):
        user = User.objects.create_user(
            email='engineer@test.com',
            password='securepass123',
            first_name='John',
            last_name='Doe',
            role='engineer',
        )
        assert user.email == 'engineer@test.com'
        assert user.role == 'engineer'
        assert user.check_password('securepass123')
        assert not user.is_staff
        assert user.full_name == 'John Doe'

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email='admin@test.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User',
        )
        assert admin.is_staff
        assert admin.is_superuser
        assert admin.role == 'admin'

    def test_unique_email(self):
        User.objects.create_user(email='dup@test.com', password='pass123', first_name='A', last_name='B')
        with pytest.raises(Exception):
            User.objects.create_user(email='dup@test.com', password='pass123', first_name='C', last_name='D')


@pytest.mark.django_db
class TestAuthAPI:
    def test_register_engineer(self, client):
        response = client.post('/api/auth/register/', {
            'email': 'new@engineer.com',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'role': 'engineer',
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!',
        }, content_type='application/json')
        assert response.status_code == 201
        assert User.objects.filter(email='new@engineer.com').exists()

    def test_login_returns_tokens(self, client):
        User.objects.create_user(email='test@test.com', password='pass123!', first_name='T', last_name='T')
        response = client.post('/api/auth/login/', {
            'email': 'test@test.com', 'password': 'pass123!',
        }, content_type='application/json')
        assert response.status_code == 200
        assert 'access' in response.json()
        assert 'refresh' in response.json()
