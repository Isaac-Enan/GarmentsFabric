from django.contrib import admin

from .models import Company, CompanyAddress


class CompanyAddressInline(admin.TabularInline):
    model = CompanyAddress
    extra = 1


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "company_type",
        "verification_status",
        "contact_phone",
        "contact_email",
        "credit_status",
        "created_at",
    )
    list_filter = ("company_type", "verification_status", "credit_status")
    search_fields = ("name", "contact_email", "contact_phone", "trade_license_number")
    inlines = [CompanyAddressInline]


@admin.register(CompanyAddress)
class CompanyAddressAdmin(admin.ModelAdmin):
    list_display = ("company", "address_type", "district", "division", "is_default")
    list_filter = ("address_type", "division")
    search_fields = ("company__name", "street_address", "district")
