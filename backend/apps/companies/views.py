from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAdmin

from .selectors import (
    get_user_primary_company,
    list_company_addresses,
    list_pending_companies,
)
from .serializers import (
    CompanyAddressSerializer,
    CompanyKYCUpdateSerializer,
    CompanySerializer,
    CompanyVerificationActionSerializer,
)
from .services import (
    create_company_address,
    update_company_kyc,
    verify_company,
)


class MyCompanyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: CompanySerializer},
        description="Get current user company details and verification status",
    )
    def get(self, request):
        company = get_user_primary_company(request.user.id)
        if not company:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "no_company",
                        "message": "No company associated with this account.",
                    },
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"success": True, "data": CompanySerializer(company).data})

    @extend_schema(
        request=CompanyKYCUpdateSerializer,
        responses={200: CompanySerializer},
        description="Update company KYC details and documents",
    )
    def patch(self, request):
        company = get_user_primary_company(request.user.id)
        if not company:
            return Response(
                {"success": False, "error": {"code": "no_company", "message": "No company found."}},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = CompanyKYCUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = update_company_kyc(company=company, data=serializer.validated_data)
        return Response({"success": True, "data": CompanySerializer(updated).data})


class CompanyAddressListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: CompanyAddressSerializer(many=True)})
    def get(self, request):
        company = get_user_primary_company(request.user.id)
        if not company:
            return Response({"success": True, "data": []})
        addresses = list_company_addresses(str(company.id))
        return Response(
            {"success": True, "data": CompanyAddressSerializer(addresses, many=True).data}
        )

    @extend_schema(request=CompanyAddressSerializer, responses={201: CompanyAddressSerializer})
    def post(self, request):
        company = get_user_primary_company(request.user.id)
        if not company:
            return Response(
                {"success": False, "error": {"code": "no_company", "message": "No company found."}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = CompanyAddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        address = create_company_address(company=company, data=serializer.validated_data)
        return Response(
            {"success": True, "data": CompanyAddressSerializer(address).data},
            status=status.HTTP_201_CREATED,
        )


class AdminKYCQueueView(APIView):
    permission_classes = [IsAdmin]

    @extend_schema(
        responses={200: CompanySerializer(many=True)},
        description="List companies pending KYC approval",
    )
    def get(self, request):
        pending = list_pending_companies()
        return Response({"success": True, "data": CompanySerializer(pending, many=True).data})


class AdminVerifyCompanyView(APIView):
    permission_classes = [IsAdmin]

    @extend_schema(
        request=CompanyVerificationActionSerializer,
        responses={200: CompanySerializer},
        description="Approve or reject company KYC",
    )
    def post(self, request, company_id):
        serializer = CompanyVerificationActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = verify_company(
            company_id=str(company_id),
            action=serializer.validated_data["action"],
            rejection_reason=serializer.validated_data.get("rejection_reason", ""),
            credit_limit=serializer.validated_data.get("credit_limit"),
            credit_terms_days=serializer.validated_data.get("credit_terms_days"),
        )
        return Response({"success": True, "data": CompanySerializer(company).data})
