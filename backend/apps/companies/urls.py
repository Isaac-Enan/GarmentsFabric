from django.urls import path

from .views import (
    AdminKYCQueueView,
    AdminVerifyCompanyView,
    CompanyAddressListView,
    MyCompanyView,
)

app_name = "companies"

urlpatterns = [
    path("my-company/", MyCompanyView.as_view(), name="my_company"),
    path("addresses/", CompanyAddressListView.as_view(), name="company_addresses"),
    path("admin/kyc-queue/", AdminKYCQueueView.as_view(), name="admin_kyc_queue"),
    path(
        "admin/<uuid:company_id>/verify/",
        AdminVerifyCompanyView.as_view(),
        name="admin_verify_company",
    ),
]
