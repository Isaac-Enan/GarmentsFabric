from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem, OrderTrackingEvent


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderTrackingEventInline(admin.TabularInline):
    model = OrderTrackingEvent
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "buyer",
        "status",
        "total_amount",
        "currency",
        "payment_method",
        "created_at",
    )
    list_filter = ("status", "payment_method")
    search_fields = ("order_number", "buyer__name")
    inlines = [OrderItemInline, OrderTrackingEventInline]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("buyer", "updated_at")


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("cart", "fabric_roll", "requested_yards", "unit_price")
