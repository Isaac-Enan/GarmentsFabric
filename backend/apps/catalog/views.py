from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.companies.models import Company, CompanyTypeChoices
from apps.companies.selectors import get_user_primary_company
from common.exceptions import NotFoundError, ValidationError
from common.permissions import CanBuildFabricProfileForBuyer
from common.utils import generate_reference_code

from .models import FabricRoll, FabricRollImage
from .selectors import get_fabric_roll_by_id, list_categories, list_fabric_rolls
from .serializers import (
    FabricCategorySerializer,
    FabricRollCreateSerializer,
    FabricRollDetailSerializer,
    FabricRollListSerializer,
)


class FabricCategoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(responses={200: FabricCategorySerializer(many=True)})
    def get(self, request):
        categories = list_categories()
        serializer = FabricCategorySerializer(categories, many=True)
        return Response({"success": True, "data": serializer.data})


class FabricRollListView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter("search", str, required=False),
            OpenApiParameter("fabric_type", str, required=False),
            OpenApiParameter("category", str, required=False),
            OpenApiParameter("min_gsm", int, required=False),
            OpenApiParameter("max_gsm", int, required=False),
            OpenApiParameter("color", str, required=False),
            OpenApiParameter("min_yards", float, required=False),
            OpenApiParameter("max_price", float, required=False),
            OpenApiParameter("factory_id", str, required=False),
            OpenApiParameter("mine", str, required=False),
            OpenApiParameter("target_buyer_id", str, required=False),
            OpenApiParameter("custom_only", str, required=False),
        ],
        responses={200: FabricRollListSerializer(many=True)},
    )
    def get(self, request):
        factory_id = request.query_params.get("factory_id")
        buyer_access_id = None
        is_owner = False
        if request.user.is_authenticated:
            user_company = get_user_primary_company(request.user.id)
            if user_company:
                if request.query_params.get("mine") == "true":
                    factory_id = str(user_company.id)
                    is_owner = True
                elif factory_id and (
                    str(user_company.id) == factory_id or request.user.role == "ADMIN"
                ):
                    is_owner = True
                if user_company.company_type == "BUYER":
                    buyer_access_id = str(user_company.id)

        custom_only = request.query_params.get("custom_only") == "true"
        target_buyer_id = request.query_params.get("target_buyer_id")
        if custom_only and not target_buyer_id and buyer_access_id:
            target_buyer_id = buyer_access_id

        rolls = list_fabric_rolls(
            search=request.query_params.get("search"),
            fabric_type=request.query_params.get("fabric_type"),
            category=request.query_params.get("category"),
            min_gsm=(
                int(request.query_params["min_gsm"])
                if request.query_params.get("min_gsm")
                else None
            ),
            max_gsm=(
                int(request.query_params["max_gsm"])
                if request.query_params.get("max_gsm")
                else None
            ),
            color=request.query_params.get("color"),
            min_yards=(
                float(request.query_params["min_yards"])
                if request.query_params.get("min_yards")
                else None
            ),
            max_price=(
                float(request.query_params["max_price"])
                if request.query_params.get("max_price")
                else None
            ),
            factory_id=factory_id,
            target_buyer_id=target_buyer_id,
            custom_only=custom_only,
            buyer_access_id=buyer_access_id,
            is_owner=is_owner,
        )
        serializer = FabricRollListSerializer(rolls, many=True)
        return Response({"success": True, "data": serializer.data})

    @extend_schema(
        request=FabricRollCreateSerializer,
        responses={201: FabricRollDetailSerializer},
        description="Factory user or Central Admin builds a fabric profile or lists a surplus fabric roll for a buyer",
    )
    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {
                    "success": False,
                    "error": {"code": "unauthorized", "message": "Authentication required."},
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not CanBuildFabricProfileForBuyer().has_permission(request, self):
            raise ValidationError(
                "Only users with the Factory or Administrator role are permitted to build fabric profiles."
            )

        company = get_user_primary_company(request.user.id)
        if not company or company.company_type != "FACTORY":
            if not (request.user.role == "ADMIN" or request.user.is_staff):
                raise ValidationError(
                    "Only registered garment factories or administrators can build fabric profiles."
                )

        serializer = FabricRollCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        target_buyer_id = validated_data.pop("target_buyer_id", None)
        target_buyer = None
        if target_buyer_id:
            target_buyer = Company.objects.filter(
                id=target_buyer_id, company_type=CompanyTypeChoices.BUYER
            ).first()
            if not target_buyer:
                raise ValidationError(
                    "Selected buyer company does not exist or is not a registered buyer."
                )
            validated_data["target_buyer"] = target_buyer
            validated_data["is_custom_profile"] = True

        image_url = validated_data.pop("image_url", None)
        if "available_yards" not in validated_data or validated_data["available_yards"] is None:
            validated_data["available_yards"] = validated_data["total_yards"]

        roll_code = generate_reference_code(prefix="ROL-2026", length=5)
        # Ensure roll_code is unique
        while FabricRoll.objects.filter(roll_code=roll_code).exists():
            roll_code = generate_reference_code(prefix="ROL-2026", length=5)

        roll = FabricRoll.objects.create(
            factory=company,
            roll_code=roll_code,
            **validated_data,
        )

        if image_url:
            FabricRollImage.objects.create(
                fabric_roll=roll,
                image_url=image_url,
                is_primary=True,
            )

        success_message = (
            f"Custom fabric profile built successfully for {target_buyer.name}."
            if target_buyer
            else "Surplus fabric roll listed successfully."
        )

        return Response(
            {
                "success": True,
                "message": success_message,
                "data": FabricRollDetailSerializer(roll).data,
            },
            status=status.HTTP_201_CREATED,
        )


class FabricRollDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(responses={200: FabricRollDetailSerializer})
    def get(self, request, roll_id):
        roll = get_fabric_roll_by_id(str(roll_id))
        if not roll:
            raise NotFoundError(
                "The specified surplus fabric roll was not found or has been sold out."
            )
        serializer = FabricRollDetailSerializer(roll)
        return Response({"success": True, "data": serializer.data})
