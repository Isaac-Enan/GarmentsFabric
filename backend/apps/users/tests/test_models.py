import pytest

from apps.users.models import RoleChoices, User, UserProfile


@pytest.mark.django_db
def test_create_user_with_email_and_phone():
    user = User.objects.create_user(
        email="factory@fabrilink.test",
        phone="+8801711000001",
        password="securePassword123!",
        role=RoleChoices.FACTORY,
    )
    assert user.email == "factory@fabrilink.test"
    assert user.phone == "+8801711000001"
    assert user.role == RoleChoices.FACTORY
    assert user.check_password("securePassword123!")
    assert user.is_active is True
    assert user.is_staff is False
    assert user.is_verified is False


@pytest.mark.django_db
def test_create_superuser():
    admin_user = User.objects.create_superuser(
        email="admin@fabrilink.test",
        phone="+8801711000002",
        password="adminPassword123!",
    )
    assert admin_user.is_staff is True
    assert admin_user.is_superuser is True
    assert admin_user.role == RoleChoices.ADMIN
    assert admin_user.is_verified is True


@pytest.mark.django_db
def test_user_profile_full_name():
    user = User.objects.create_user(
        email="buyer@fabrilink.test",
        phone="+8801711000003",
        password="buyerPassword123!",
        role=RoleChoices.BUYER,
    )
    profile = UserProfile.objects.create(
        user=user,
        first_name="Tahmina",
        last_name="Akter",
        preferred_language="bn",
    )
    assert profile.full_name == "Tahmina Akter"
    assert profile.preferred_language == "bn"
