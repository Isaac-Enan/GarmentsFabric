from decimal import Decimal

from django.db import transaction

from apps.catalog.models import FabricRoll
from apps.companies.models import Company
from apps.inventory.models import StockLedger, StockTransactionTypeChoices
from common.exceptions import InsufficientStockError, NotFoundError, RollBreakdownError
from common.utils import generate_reference_code

from .models import Cart, CartItem, Order, OrderItem, OrderStatusChoices, OrderTrackingEvent

# Platform Fee Rates
COMMISSION_RATE = Decimal("0.06")  # 6% Platform commission
BASE_CUTTING_FEE = Decimal("150.00")  # ৳150 base machine cut fee
PER_YARD_CUTTING_FEE = Decimal("5.00")  # ৳5 per yard
STANDARD_DELIVERY_FEE = Decimal("120.00")  # ৳120 courier flat fee
BD_VAT_RATE = Decimal("0.15")  # 15% VAT on commission & cutting service


def calculate_order_fees(subtotal: Decimal, total_yards: Decimal) -> dict[str, Decimal]:
    """Calculates all itemized fees, platform commission, courier, and Bangladesh VAT."""
    commission = (subtotal * COMMISSION_RATE).quantize(Decimal("0.01"))
    cutting = (BASE_CUTTING_FEE + (total_yards * PER_YARD_CUTTING_FEE)).quantize(Decimal("0.01"))
    delivery = STANDARD_DELIVERY_FEE
    vat = ((commission + cutting) * BD_VAT_RATE).quantize(Decimal("0.01"))
    total = (subtotal + commission + cutting + delivery + vat).quantize(Decimal("0.01"))

    return {
        "items_subtotal": subtotal,
        "platform_commission_fee": commission,
        "cutting_fee": cutting,
        "delivery_fee": delivery,
        "vat_tax_amount": vat,
        "total_amount": total,
    }


def validate_roll_breakdown(roll: FabricRoll, requested_yards: Decimal) -> None:
    """
    Enforces the core roll-breakdown invariants:
    1. requested_yards >= min_cut_length_yards
    2. requested_yards <= available_yards
    3. leftover must be either 0 OR >= min_cut_length_yards
    """
    min_cut = roll.min_cut_length_yards
    avail = roll.available_yards

    if requested_yards < min_cut:
        raise RollBreakdownError(
            f"The minimum cut length for this roll is {min_cut} yards. Requested: {requested_yards} yards."
        )

    if requested_yards > avail:
        raise InsufficientStockError(
            f"Requested {requested_yards} yards exceeds current available roll stock ({avail} yards)."
        )

    leftover = avail - requested_yards
    if leftover > Decimal("0.00") and leftover < min_cut:
        raise RollBreakdownError(
            f"Invalid breakdown: Cutting {requested_yards} yards leaves an unsellable remnant of {leftover} yards. "
            f"Remaining piece must be 0 yards (take whole roll) or at least {min_cut} yards."
        )


@transaction.atomic
def add_item_to_cart(
    *,
    buyer: Company,
    roll_id: str,
    requested_yards: Decimal,
) -> CartItem:
    """Validates breakdown constraints and adds/updates an item in the buyer's cart."""
    roll = FabricRoll.objects.select_for_update().filter(id=roll_id, is_deleted=False).first()
    if not roll:
        raise NotFoundError("Fabric roll not found.")

    validate_roll_breakdown(roll, requested_yards)

    cart, _ = Cart.objects.get_or_create(buyer=buyer)

    cart_item = CartItem.objects.filter(cart=cart, fabric_roll=roll).first()
    if cart_item:
        cart_item.requested_yards = requested_yards
        cart_item.unit_price = roll.price_per_yard
        cart_item.save()
    else:
        cart_item = CartItem.objects.create(
            cart=cart,
            fabric_roll=roll,
            requested_yards=requested_yards,
            unit_price=roll.price_per_yard,
        )

    return cart_item


@transaction.atomic
def checkout_cart(
    *,
    buyer: Company,
    payment_method: str = "BKASH",
    delivery_notes: str = "",
) -> Order:
    """
    Converts Cart into Order:
    1. Concurrency locks all rolls in cart using select_for_update().
    2. Deducts available yards atomically.
    3. Writes append-only StockLedger rows.
    4. Creates Order, OrderItems, and initial OrderTrackingEvent.
    5. Clears Cart.
    """
    cart = Cart.objects.filter(buyer=buyer).first()
    if not cart or not cart.items.exists():
        raise RollBreakdownError("Cart is empty. Add a fabric roll breakdown first.")

    subtotal = Decimal("0.00")
    total_yards = Decimal("0.00")
    items_to_process = []

    # Atomic stock check and deduction
    for item in cart.items.select_related("fabric_roll"):
        roll = FabricRoll.objects.select_for_update().get(id=item.fabric_roll_id)
        validate_roll_breakdown(roll, item.requested_yards)

        item_total = item.requested_yards * roll.price_per_yard
        subtotal += item_total
        total_yards += item.requested_yards

        # Deduct available yardage
        previous_avail = roll.available_yards
        roll.available_yards -= item.requested_yards
        if roll.available_yards == Decimal("0.00"):
            roll.status = "SOLD_OUT"
        else:
            roll.status = "RESERVED_PARTIAL"
        roll.save()

        # Append to Stock Ledger
        StockLedger.objects.create(
            fabric_roll=roll,
            transaction_type=StockTransactionTypeChoices.ORDER_CUT,
            yards_change=-item.requested_yards,
            balance_after=roll.available_yards,
            reference_id=cart.id,
            notes=f"Order checkout hold by {buyer.name}",
        )

        items_to_process.append(
            (roll, item.requested_yards, roll.price_per_yard, item_total, previous_avail)
        )

    fees = calculate_order_fees(subtotal, total_yards)

    order = Order.objects.create(
        order_number=generate_reference_code(prefix="ORD", length=8),
        buyer=buyer,
        status=OrderStatusChoices.PAID_CREDIT_APPROVED,
        items_subtotal=fees["items_subtotal"],
        platform_commission_fee=fees["platform_commission_fee"],
        cutting_fee=fees["cutting_fee"],
        delivery_fee=fees["delivery_fee"],
        vat_tax_amount=fees["vat_tax_amount"],
        total_amount=fees["total_amount"],
        payment_method=payment_method,
        delivery_notes=delivery_notes,
    )

    for roll, yards, unit_price, item_subtotal, prev_avail in items_to_process:
        OrderItem.objects.create(
            order=order,
            fabric_roll=roll,
            requested_yards=yards,
            unit_price=unit_price,
            subtotal=item_subtotal,
            min_cut_length_snapshot=roll.min_cut_length_yards,
            remaining_yards_snapshot=roll.available_yards,
            factory_payout_amount=item_subtotal,
            status="PENDING",
        )

    # Initial order tracking event
    OrderTrackingEvent.objects.create(
        order=order,
        from_status="DRAFT",
        to_status=order.status,
        title="Order Placed & Payment Authorized",
        description=f"Breakdown hold confirmed for {total_yards} yards. Cutting job dispatched to Tejgaon Hub.",
        location="FabriLink Central Clearing",
    )

    # Clear cart
    cart.items.all().delete()

    return order
