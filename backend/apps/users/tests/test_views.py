import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import RoleChoices, User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_register_api_flow(api_client):
    payload = {
        "email": "api_buyer@fabrilink.com",
        "phone": "+8801700112233",
        "password": "Password789!",
        "role": "BUYER",
        "company_name": "Dhaka Trendz Boutique",
        "first_name": "Nasreen",
        "last_name": "Sultana",
        "preferred_language": "bn",
    }
    response = api_client.post("/api/v1/auth/register/", payload, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["success"] is True
    assert "access_token" in response.data["data"]
    assert response.data["data"]["user"]["email"] == "api_buyer@fabrilink.com"
    assert response.data["data"]["user"]["role"] == "BUYER"
    # Ensure refresh cookie was set
    assert "fabrilink_refresh_token" in response.cookies


@pytest.mark.django_db
def test_login_api_flow(api_client):
    User.objects.create_user(
        email="login_test@fabrilink.com",
        phone="+8801799887766",
        password="MyPassword123!",
        role=RoleChoices.FACTORY,
    )

    login_payload = {
        "email": "login_test@fabrilink.com",
        "password": "MyPassword123!",
    }
    response = api_client.post("/api/v1/auth/login/", login_payload, format="json")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["success"] is True
    assert "access_token" in response.data["data"]
    assert "fabrilink_refresh_token" in response.cookies


@pytest.mark.django_db
def test_me_api_endpoint(api_client):
    user = User.objects.create_user(
        email="me_test@fabrilink.com",
        phone="+8801688776655",
        password="MyPassword123!",
        role=RoleChoices.BUYER,
    )
    api_client.force_authenticate(user=user)

    response = api_client.get("/api/v1/auth/me/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["success"] is True
    assert response.data["data"]["email"] == "me_test@fabrilink.com"
