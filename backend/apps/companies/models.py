from django.conf import settings
from django.db import models

from common.models import TimeStampedModel, UUIDModel


class CompanyTypeChoices(models.TextChoices):
    FACTORY = "FACTORY", "Garment Factory / Mill"
    BUYER = "BUYER", "Boutique / Brand / Startup"


class VerificationStatusChoices(models.TextChoices):
    PENDING = "PENDING", "Pending Review"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"
    SUSPENDED = "SUSPENDED", "Suspended"


class CreditStatusChoices(models.TextChoices):
    INELIGIBLE = "INELIGIBLE", "Ineligible"
    ELIGIBLE = "ELIGIBLE", "Eligible"
    ACTIVE = "ACTIVE", "Active"
    BLOCKED = "BLOCKED", "Blocked"


class Company(UUIDModel, TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="companies",
    )
    name = models.CharField(max_length=255, db_index=True)
    company_type = models.CharField(max_length=20, choices=CompanyTypeChoices.choices)
    trade_license_number = models.CharField(max_length=100, blank=True)
    tin_number = models.CharField(max_length=50, blank=True)
    bin_number = models.CharField(max_length=50, blank=True)

    trade_license_file = models.FileField(upload_to="kyc/trade_licenses/", blank=True, null=True)
    tin_file = models.FileField(upload_to="kyc/tin/", blank=True, null=True)
    bin_file = models.FileField(upload_to="kyc/bin/", blank=True, null=True)

    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatusChoices.choices,
        default=VerificationStatusChoices.PENDING,
        db_index=True,
    )
    rejection_reason = models.TextField(blank=True)

    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)

    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    credit_terms_days = models.IntegerField(default=0)
    credit_status = models.CharField(
        max_length=20,
        choices=CreditStatusChoices.choices,
        default=CreditStatusChoices.INELIGIBLE,
    )

    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.get_company_type_display()}) - {self.verification_status}"


class AddressTypeChoices(models.TextChoices):
    FACTORY_PREMISES = "FACTORY_PREMISES", "Factory Premises"
    WAREHOUSE = "WAREHOUSE", "Warehouse"
    BILLING = "BILLING", "Billing Address"
    DELIVERY = "DELIVERY", "Delivery Address"


class CompanyAddress(UUIDModel, TimeStampedModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="addresses")
    address_type = models.CharField(max_length=30, choices=AddressTypeChoices.choices)
    division = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    upazila_thana = models.CharField(max_length=100)
    street_address = models.TextField()
    postal_code = models.CharField(max_length=20)
    landmark = models.CharField(max_length=255, blank=True)
    gps_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    gps_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Company Address"
        verbose_name_plural = "Company Addresses"

    def __str__(self):
        return f"{self.company.name} - {self.get_address_type_display()} ({self.district})"
