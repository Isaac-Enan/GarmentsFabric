from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.catalog.models import FabricRoll
from apps.companies.models import Company
from common.models import TimeStampedModel, UUIDModel


class ReservationStatusChoices(models.TextChoices):
    ACTIVE = "ACTIVE", "Active Hold"
    CONVERTED_TO_ORDER = "CONVERTED_TO_ORDER", "Converted to Order"
    EXPIRED = "EXPIRED", "Expired"
    CANCELLED = "CANCELLED", "Cancelled"


class StockReservation(UUIDModel, TimeStampedModel):
    """Temporary stock reservation hold (e.g. 30 mins) during checkout."""

    fabric_roll = models.ForeignKey(
        FabricRoll, on_delete=models.PROTECT, related_name="reservations"
    )
    buyer = models.ForeignKey(Company, on_delete=models.PROTECT, related_name="reservations")
    reserved_yards = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=25,
        choices=ReservationStatusChoices.choices,
        default=ReservationStatusChoices.ACTIVE,
        db_index=True,
    )
    expires_at = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Hold {self.reserved_yards} yds of {self.fabric_roll.roll_code} ({self.status})"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at


class StockTransactionTypeChoices(models.TextChoices):
    INITIAL_LISTING = "INITIAL_LISTING", "Initial Roll Listing"
    RESERVATION_HOLD = "RESERVATION_HOLD", "Checkout Reservation Hold"
    RESERVATION_RELEASE = "RESERVATION_RELEASE", "Reservation Hold Released"
    ORDER_CUT = "ORDER_CUT", "Deducted for Hub Precision Cut"
    ADJUSTMENT = "ADJUSTMENT", "Manual Inventory Adjustment"
    RETURN_RESTOCK = "RETURN_RESTOCK", "Restocked from Return"


class StockLedger(UUIDModel, TimeStampedModel):
    """Append-only audit ledger for all fabric yardage movements."""

    fabric_roll = models.ForeignKey(
        FabricRoll, on_delete=models.PROTECT, related_name="ledger_entries"
    )
    transaction_type = models.CharField(max_length=30, choices=StockTransactionTypeChoices.choices)
    yards_change = models.DecimalField(max_digits=10, decimal_places=2)
    balance_after = models.DecimalField(max_digits=10, decimal_places=2)
    reference_id = models.CharField(max_length=100, blank=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.transaction_type}: {self.yards_change} yds on {self.fabric_roll.roll_code}"
