import pytest

from apps.users.models import RoleChoices
from apps.users.services import authenticate_user, register_user
from common.exceptions import ConflictError, ValidationError


@pytest.mark.django_db
def test_register_user_creates_user_profile_and_company():
    user, tokens = register_user(
        email="test_factory@fabrilink.com",
        phone="+8801811223344",
        password="ValidPassword123!",
        role=RoleChoices.FACTORY,
        company_name="Apex Spinning Ltd",
        first_name="Rahim",
        last_name="Uddin",
        preferred_language="bn",
    )
    assert user.email == "test_factory@fabrilink.com"
    assert user.profile.first_name == "Rahim"
    assert user.profile.preferred_language == "bn"
    assert "access" in tokens
    assert "refresh" in tokens

    company = user.companies.first()
    assert company is not None
    assert company.name == "Apex Spinning Ltd"
    assert company.company_type == "FACTORY"
    assert company.verification_status == "PENDING"


@pytest.mark.django_db
def test_register_user_duplicate_email_raises_conflict():
    register_user(
        email="duplicate@fabrilink.com",
        phone="+8801911223344",
        password="ValidPassword123!",
        role=RoleChoices.BUYER,
        company_name="Boutique One",
    )
    with pytest.raises(ConflictError):
        register_user(
            email="duplicate@fabrilink.com",
            phone="+8801911223399",
            password="ValidPassword123!",
            role=RoleChoices.BUYER,
            company_name="Boutique Two",
        )


@pytest.mark.django_db
def test_authenticate_user_valid_and_invalid():
    register_user(
        email="auth_user@fabrilink.com",
        phone="+8801511223344",
        password="MyPassword123!",
        role=RoleChoices.BUYER,
        company_name="Crafty Wear",
    )

    user, tokens = authenticate_user(email="auth_user@fabrilink.com", password="MyPassword123!")
    assert user.email == "auth_user@fabrilink.com"
    assert "access" in tokens

    with pytest.raises(ValidationError):
        authenticate_user(email="auth_user@fabrilink.com", password="WrongPassword!")
