from typing import Any

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


class DomainException(Exception):
    """Base domain exception."""

    default_code = "domain_error"
    default_message = "A business domain error occurred."
    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(
        self,
        message: str | None = None,
        code: str | None = None,
        details: Any | None = None,
        status_code: int | None = None,
    ):
        self.message = message or self.default_message
        self.code = code or self.default_code
        self.details = details or {}
        if status_code:
            self.status_code = status_code
        super().__init__(self.message)


class NotFoundError(DomainException):
    default_code = "not_found"
    default_message = "The requested resource was not found."
    status_code = status.HTTP_404_NOT_FOUND


class ValidationError(DomainException):
    default_code = "validation_error"
    default_message = "Validation failed on the provided data."
    status_code = status.HTTP_400_BAD_REQUEST


class ConflictError(DomainException):
    default_code = "conflict"
    default_message = "A conflicting operation or duplicate record exists."
    status_code = status.HTTP_409_CONFLICT


class PermissionDeniedError(DomainException):
    default_code = "permission_denied"
    default_message = "You do not have permission to perform this action."
    status_code = status.HTTP_403_FORBIDDEN


class InsufficientStockError(DomainException):
    default_code = "insufficient_stock"
    default_message = "Requested yardage exceeds available roll stock."
    status_code = status.HTTP_400_BAD_REQUEST


class RollBreakdownError(DomainException):
    default_code = "invalid_roll_breakdown"
    default_message = "The requested cut violates roll breakdown constraints."
    status_code = status.HTTP_400_BAD_REQUEST


class InvalidStateTransitionError(DomainException):
    default_code = "invalid_state_transition"
    default_message = "The requested state transition is not permitted."
    status_code = status.HTTP_400_BAD_REQUEST


def custom_exception_handler(exc: Exception, context: dict) -> Response | None:
    """
    Standardizes error responses across DRF and domain service exceptions into:
    {
        "success": False,
        "error": {
            "code": "...",
            "message": "...",
            "details": {...}
        }
    }
    """
    if isinstance(exc, DomainException):
        return Response(
            {
                "success": False,
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                },
            },
            status=exc.status_code,
        )

    # Standard DRF exception handling fallback
    response = exception_handler(exc, context)

    if response is not None:
        data = response.data
        message = "An error occurred."
        code = "api_error"

        if isinstance(data, dict):
            if "detail" in data:
                message = str(data["detail"])
                code = getattr(data["detail"], "code", "error")
            else:
                message = "Validation failed on one or more fields."
                code = "validation_error"
        elif isinstance(data, list):
            message = "; ".join(str(item) for item in data)

        response.data = {
            "success": False,
            "error": {
                "code": code,
                "message": message,
                "details": data,
            },
        }

    return response
