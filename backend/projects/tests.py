import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import Project, CommercialRequest
from users.models import DeveloperProfile
User = get_user_model()

# --- ФИКСТУРЫ (Подготовка тестовых данных) ---

@pytest.fixture
def api_client():
    """Анонимный клиент для тестов"""
    return APIClient()

@pytest.fixture
def admin_client():
    """Авторизованный клиент с правами администратора"""
    user = User.objects.create_superuser('admin', 'admin@test.com', 'password123')
    client = APIClient()
    client.force_authenticate(user=user)
    return client

# --- ТЕСТЫ ДОСТУПА К ПРОЕКТАМ ---

@pytest.mark.django_db
def test_get_projects_list_public(api_client):
    """Тест: Анонимный пользователь может просматривать список проектов"""
    response = api_client.get('/api/v1/projects/projects/')
    assert response.status_code == 200

@pytest.mark.django_db
def test_create_project_unauthorized(api_client):
    """Тест: Анонимный пользователь НЕ может создавать проекты (Защита)"""
    data = {
        "title": "Hack Project",
        "short_description": "Test",
        "description": "Test"
    }
    response = api_client.post('/api/v1/projects/projects/', data)
    assert response.status_code == 401 # Unauthorized

@pytest.mark.django_db
def test_create_project_as_admin(admin_client):
    """Тест: Администратор может создать проект"""
    
    # 1. Создаем тестового пользователя и его профиль разработчика
    dev_user = User.objects.create(username='dev_test', email='dev@test.com', nickname='dev_test_nick', is_developer=True)
    # Используем get_or_create на случай, если профиль уже автоматически создается сигналами
    dev_profile, _ = DeveloperProfile.objects.get_or_create(user=dev_user, defaults={'role': 'Backend'})

    # 2. Формируем дату с реальным ID разработчика
    data = {
        "title": "Super Game",
        "short_description": "RPG",
        "description": "Epic game description",
        "developers": [dev_profile.id]  # <-- ТЕПЕРЬ СПИСОК НЕ ПУСТОЙ!
    }

    response = admin_client.post('/api/v1/projects/projects/', data, format='json')

    # Отладка (на всякий случай)
    if response.status_code != 201:
        print("\n=== ОШИБКА ВАЛИДАЦИИ DRF ===")
        print(response.data)
        print("============================\n")

    assert response.status_code == 201 # Created
    assert Project.objects.count() == 1
# --- ТЕСТЫ КОММЕРЧЕСКИХ ЗАЯВОК (Студия) ---

@pytest.mark.django_db
def test_create_commercial_request(api_client):
    """Тест: Клиент может успешно отправить заявку на сотрудничество"""
    data = {
        "name": "Тестовый Клиент",
        "contact_info": "@telegram_test",
        "request_type": "order",
        "message": "Хочу заказать разработку сайта"
    }
    response = api_client.post('/api/v1/projects/requests/', data)
    
    assert response.status_code == 201
    assert CommercialRequest.objects.count() == 1
    assert CommercialRequest.objects.first().name == "Тестовый Клиент"
    
@pytest.mark.django_db
def test_commercial_request_default_status(api_client):
    """Тест: Новая заявка автоматически получает статус 'new'"""
    data = {
        "name": "ООО Ромашка",
        "contact_info": "romashka@mail.com",
        "request_type": "ad",
        "message": "Предлагаем рекламу"
    }
    api_client.post('/api/v1/projects/requests/', data)
    request_obj = CommercialRequest.objects.first()
    assert request_obj.status == 'new'