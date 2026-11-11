from decimal import Decimal

from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.companies.selectors import get_user_primary_company
from common.exceptions import NotFoundError

from .models import Cart, CartItem, Order, OrderStatusChoices, OrderTrackingEvent
from .serializers import (
    AddToCartSerializer,
    CartItemSerializer,
    CheckoutRequestSerializer,
    OrderDetailSerializer,
)
from .services import add_item_to_cart, calculate_order_fees, checkout_cart


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: CartItemSerializer(many=True)})
    def get(self, request):
        company = get_user_primary_company(request.user.id)
        if not company:
            return Response({"success": True, "data": {"items": [], "fees": {}}})

        cart, _ = Cart.objects.get_or_create(buyer=company)
        items = cart.items.select_related("fabric_roll").all()
        items_serializer = CartItemSerializer(items, many=True)

        subtotal = sum((item.requested_yards * item.unit_price for item in items), Decimal("0.00"))
        total_yards = sum((item.requested_yards for item in items), Decimal("0.00"))
        fees = calculate_order_fees(subtotal, total_yards)

        return Response(
            {
                "success": True,
                "data": {
                    "items": items_serializer.data,
                    "fees": {k: str(v) for k, v in fees.items()},
                },
            }
        )

    @extend_schema(request=AddToCartSerializer, responses={201: CartItemSerializer})
    def post(self, request):
        company = get_user_primary_company(request.user.id)
        if not company:
            raise NotFoundError("Buyer company profile not found.")

        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart_item = add_item_to_cart(
            buyer=company,
            roll_id=str(serializer.validated_data["fabric_roll_id"]),
            requested_yards=serializer.validated_data["requested_yards"],
        )

        return Response(
            {
                "success": True,
                "message": "Fabric roll breakdown added to cart.",
                "data": CartItemSerializer(cart_item).data,
            },
            status=status.HTTP_201_CREATED,
        )


class CartItemDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        company = get_user_primary_company(request.user.id)
        if not company:
            raise NotFoundError("Company not found.")

        item = CartItem.objects.filter(id=item_id, cart__buyer=company).first()
        if not item:
            raise NotFoundError("Cart item not found.")

        item.delete()
        return Response({"success": True, "message": "Item removed from cart."})


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=CheckoutRequestSerializer, responses={201: OrderDetailSerializer})
    def post(self, request):
        company = get_user_primary_company(request.user.id)
        if not company:
            raise NotFoundError("Buyer company not found.")

        serializer = CheckoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = checkout_cart(
            buyer=company,
            payment_method=serializer.validated_data.get("payment_method", "BKASH"),
            delivery_notes=serializer.validated_data.get("delivery_notes", ""),
        )

        return Response(
            {
                "success": True,
                "message": "Order created and payment authorized successfully.",
                "data": OrderDetailSerializer(order).data,
            },
            status=status.HTTP_201_CREATED,
        )


class OrderListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: OrderDetailSerializer(many=True)})
    def get(self, request):
        company = get_user_primary_company(request.user.id)
        status_filter = request.query_params.get("status")

        if request.user.role in ["ADMIN", "HUB_STAFF"] or request.user.is_staff:
            orders = (
                Order.objects.all()
                .prefetch_related("items", "tracking_events")
                .order_by("-created_at")
            )
        elif not company:
            return Response({"success": True, "data": []})
        elif company.company_type == "FACTORY":
            orders = (
                Order.objects.filter(items__fabric_roll__factory=company)
                .distinct()
                .prefetch_related("items", "tracking_events")
                .order_by("-created_at")
            )
        else:
            orders = (
                Order.objects.filter(buyer=company)
                .prefetch_related("items", "tracking_events")
                .order_by("-created_at")
            )

        if status_filter:
            orders = orders.filter(status=status_filter)

        serializer = OrderDetailSerializer(orders, many=True)
        return Response({"success": True, "data": serializer.data})


class OrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: OrderDetailSerializer})
    def get(self, request, order_id):
        order = (
            Order.objects.filter(id=order_id).prefetch_related("items", "tracking_events").first()
        )
        if not order:
            raise NotFoundError("Order not found.")
        return Response({"success": True, "data": OrderDetailSerializer(order).data})


class OrderStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, order_id):
        order = (
            Order.objects.filter(id=order_id).prefetch_related("items", "tracking_events").first()
        )
        if not order:
            raise NotFoundError("Order not found.")

        new_status = request.data.get("status")
        notes = request.data.get("notes", "")
        location = request.data.get("location", "Tejgaon Central Hub")

        if new_status and new_status in OrderStatusChoices.values:
            from_status = order.status
            order.status = new_status
            order.save()

            status_labels = {
                OrderStatusChoices.PICKUP_SCHEDULED: "Pickup Scheduled from Mill",
                OrderStatusChoices.PICKED_UP: "Picked Up from Mill",
                OrderStatusChoices.AT_HUB: "Received at Central Hub & Scanned",
                OrderStatusChoices.CUTTING: "Precision Machine Cutting in Progress",
                OrderStatusChoices.CUT_DONE: "Precision Cut Completed",
                OrderStatusChoices.PACKED: "Packed & Barcode Tag Attached",
                OrderStatusChoices.OUT_FOR_DELIVERY: "Handed to Courier (Out for Delivery)",
                OrderStatusChoices.DELIVERED: "Delivered to Boutique",
                OrderStatusChoices.COMPLETED: "Completed & Settled",
            }
            title = status_labels.get(new_status, f"Order status updated to {new_status}")
            desc = notes or f"Order transitioned from {from_status} to {new_status}."

            OrderTrackingEvent.objects.create(
                order=order,
                from_status=from_status,
                to_status=new_status,
                title=title,
                description=desc,
                location=location,
            )

        fresh_order = (
            Order.objects.filter(id=order_id).prefetch_related("items", "tracking_events").first()
        )
        return Response({"success": True, "data": OrderDetailSerializer(fresh_order).data})
