from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from common.exceptions import NotFoundError

from .selectors import get_fabric_roll_by_id, list_categories, list_fabric_rolls
from .serializers import (
    FabricCategorySerializer,
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
        ],
        responses={200: FabricRollListSerializer(many=True)},
    )
    def get(self, request):
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
        )
        serializer = FabricRollListSerializer(rolls, many=True)
        return Response({"success": True, "data": serializer.data})


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
