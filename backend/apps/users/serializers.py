from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from common.utils import normalize_bd_phone

from .models import RoleChoices, User, UserProfile


class UserCompanySummarySerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    company_type = serializers.CharField()
    verification_status = serializers.CharField()
    credit_limit = serializers.CharField()


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "designation",
            "avatar",
            "preferred_language",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class UserDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    company = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone",
            "role",
            "is_verified",
            "is_active",
            "profile",
            "company",
            "date_joined",
        ]
        read_only_fields = ["id", "is_verified", "is_active", "date_joined"]

    @extend_schema_field(UserCompanySummarySerializer)
    def get_company(self, obj):
        company = obj.companies.first() if hasattr(obj, "companies") else None
        if company:
            return {
                "id": str(company.id),
                "name": company.name,
                "company_type": company.company_type,
                "verification_status": company.verification_status,
                "credit_limit": str(company.credit_limit),
            }
        return None


class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=[RoleChoices.FACTORY, RoleChoices.BUYER])
    company_name = serializers.CharField(max_length=255)
    first_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    preferred_language = serializers.ChoiceField(choices=["bn", "en"], default="bn")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_phone(self, value):
        normalized = normalize_bd_phone(value)
        if User.objects.filter(phone=normalized).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return normalized


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)


class TokenRefreshRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField(
        required=False, help_text="Optional refresh token if not using httpOnly cookie"
    )


class LogoutRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField(
        required=False, help_text="Optional refresh token if not using httpOnly cookie"
    )
