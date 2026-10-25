from django.db.models import QuerySet

from .models import User


def get_user_by_id(user_id: str) -> User | None:
    """Retrieves a user by UUID with related profile and company."""
    return (
        User.objects.select_related("profile")
        .prefetch_related("companies")
        .filter(id=user_id)
        .first()
    )


def get_user_by_email(email: str) -> User | None:
    """Retrieves a user by email."""
    return (
        User.objects.select_related("profile")
        .prefetch_related("companies")
        .filter(email__iexact=email.strip())
        .first()
    )


def list_users() -> QuerySet[User]:
    """Returns all active users."""
    return (
        User.objects.select_related("profile").prefetch_related("companies").order_by("-created_at")
    )
