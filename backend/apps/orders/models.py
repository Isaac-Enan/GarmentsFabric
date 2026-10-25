from decimal import Decimal

from django.conf import settings
from django.db import models

from apps.catalog.models import FabricRoll
from apps.companies.models import Company, CompanyAddress
from common.models import TimeStampedModel, UUIDModel


class Cart(UUIDModel, TimeStampedModel):
    """Shopping cart for a boutique / buyer company."""

    buyer = models.OneToOneField(Company, on_delete=models.CASCADE, related_name="cart")

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Cart of {self.buyer.name}"

    @property
    def total_yards(self):
        return sum(item.requested_yards for item in self.items.all())

    @property
    def total_price(self):
        return sum(item.item_subtotal for item in self.items.all())


class CartItem(UUIDModel, TimeStampedModel):
    """Individual fabric roll cut request in cart."""

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    fabric_roll = models.ForeignKey(FabricRoll, on_delete=models.CASCADE, related_name="cart_items")
    requested_yards = models.DecimalField(max_digits=8, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.requested_yards} yds of {self.fabric_roll.roll_code}"

    @property
    def item_subtotal(self) -> Decimal:
        return Decimal(str(self.requested_yards)) * Decimal(str(self.unit_price))


class OrderStatusChoices(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    REQUESTED = "REQUESTED", "Requested (Breakdown Hold Confirmed)"
    QUOTED_CONFIRMED = "QUOTED_CONFIRMED", "Quoted & Confirmed"
    PAID_CREDIT_APPROVED = "PAID_CREDIT_APPROVED", "Paid / Credit Approved"
    PICKUP_SCHEDULED = "PICKUP_SCHEDULED", "Pickup Scheduled from Mill"
    PICKED_UP = "PICKED_UP", "Picked Up from Mill"
    AT_HUB = "AT_HUB", "Received at Cutting Hub"
    CUTTING = "CUTTING", "Cutting In Progress"
    CUT_DONE = "CUT_DONE", "Precision Cut Completed"
    PACKED = "PACKED", "Packed & Barcoded"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY", "Out for Delivery"
    DELIVERED = "DELIVERED", "Delivered to Boutique"
    COMPLETED = "COMPLETED", "Completed & Settled"
    CANCELLED = "CANCELLED", "Cancelled"
    DISPUTED = "DISPUTED", "Disputed"
    REFUNDED = "REFUNDED", "Refunded"


class Order(UUIDModel, TimeStampedModel):
    """B2B fabric roll purchase order."""

    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    buyer = models.ForeignKey(Company, on_delete=models.PROTECT, related_name="purchase_orders")
    status = models.CharField(
        max_length=30,
        choices=OrderStatusChoices.choices,
        default=OrderStatusChoices.PAID_CREDIT_APPROVED,
        db_index=True,
    )

    items_subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    platform_commission_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    cutting_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    vat_tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    currency = models.CharField(max_length=5, default="BDT")

    payment_method = models.CharField(max_length=30, default="BKASH")
    shipping_address = models.ForeignKey(
        CompanyAddress,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="order_deliveries",
    )
    delivery_notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order_number} ({self.buyer.name}) - {self.status}"


class OrderItem(UUIDModel, TimeStampedModel):
    """Specific cut piece from a fabric roll in an order."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    fabric_roll = models.ForeignKey(
        FabricRoll, on_delete=models.PROTECT, related_name="order_items"
    )
    requested_yards = models.DecimalField(max_digits=8, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    min_cut_length_snapshot = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("5.00")
    )
    remaining_yards_snapshot = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    factory_payout_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    status = models.CharField(max_length=20, default="PENDING")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.requested_yards} yds of {self.fabric_roll.roll_code} in {self.order.order_number}"


class OrderTrackingEvent(UUIDModel, TimeStampedModel):
    """Auditable state transition event with location & actor."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="tracking_events")
    from_status = models.CharField(max_length=50, blank=True)
    to_status = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    location = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.order.order_number}: {self.from_status} -> {self.to_status}"
