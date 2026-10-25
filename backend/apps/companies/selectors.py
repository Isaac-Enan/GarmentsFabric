from django.db.models import QuerySet

from .models import Company, CompanyAddress


def get_company_by_id(company_id: str) -> Company | None:
    return Company.objects.prefetch_related("addresses").filter(id=company_id).first()


def get_user_primary_company(user_id: str) -> Company | None:
    return Company.objects.prefetch_related("addresses").filter(user_id=user_id).first()


def list_pending_companies() -> QuerySet[Company]:
    return Company.objects.filter(verification_status="PENDING").order_by("-created_at")


def list_company_addresses(company_id: str) -> QuerySet[CompanyAddress]:
    return CompanyAddress.objects.filter(company_id=company_id).order_by(
        "-is_default", "-created_at"
    )
