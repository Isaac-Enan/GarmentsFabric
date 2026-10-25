from rest_framework import serializers

from .models import Company, CompanyAddress


class CompanyAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyAddress
        fields = [
            "id",
            "company",
            "address_type",
            "division",
            "district",
            "upazila_thana",
            "street_address",
            "postal_code",
            "landmark",
            "gps_lat",
            "gps_lng",
            "is_default",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class CompanySerializer(serializers.ModelSerializer):
    addresses = CompanyAddressSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "company_type",
            "trade_license_number",
            "tin_number",
            "bin_number",
            "trade_license_file",
            "tin_file",
            "bin_file",
            "verification_status",
            "rejection_reason",
            "contact_email",
            "contact_phone",
            "credit_limit",
            "credit_terms_days",
            "credit_status",
            "addresses",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "verification_status",
            "rejection_reason",
            "credit_limit",
            "credit_terms_days",
            "credit_status",
            "created_at",
            "updated_at",
        ]


class CompanyKYCUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "name",
            "trade_license_number",
            "tin_number",
            "bin_number",
            "trade_license_file",
            "tin_file",
            "bin_file",
            "contact_email",
            "contact_phone",
        ]


class CompanyVerificationActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["APPROVE", "REJECT", "SUSPEND"])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    credit_limit = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    credit_terms_days = serializers.IntegerField(required=False)
