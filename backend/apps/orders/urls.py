from django.urls import path

from .views import (
    CartItemDeleteView,
    CartView,
    CheckoutView,
    OrderDetailView,
    OrderListView,
)

app_name = "orders"

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/items/", CartView.as_view(), name="cart_add"),
    path("cart/items/<uuid:item_id>/", CartItemDeleteView.as_view(), name="cart_delete"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("", OrderListView.as_view(), name="order_list"),
    path("<uuid:order_id>/", OrderDetailView.as_view(), name="order_detail"),
]
