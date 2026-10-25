from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allows access only to Admin users."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "ADMIN" or request.user.is_staff)
        )


class IsFactory(BasePermission):
    """Allows access to Factory users (or Admin)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "FACTORY" or request.user.is_staff)
        )


class IsBuyer(BasePermission):
    """Allows access to Buyer users (or Admin)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "BUYER" or request.user.is_staff)
        )


class IsHubStaff(BasePermission):
    """Allows access to Hub Staff users (or Admin)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "HUB_STAFF" or request.user.is_staff)
        )


class IsVerifiedCompany(BasePermission):
    """Ensures the authenticated user has an APPROVED company status before transacting."""

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_staff or request.user.role == "ADMIN":
            return True
        company = getattr(request.user, "companies", None)
        if company and hasattr(company, "first"):
            first_co = company.first()
            return first_co is not None and first_co.verification_status == "APPROVED"
        return False
