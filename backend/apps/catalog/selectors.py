from django.db.models import Q, QuerySet

from .models import FabricCategory, FabricRoll


def get_fabric_roll_by_id(roll_id: str) -> FabricRoll | None:
    """Retrieves a single fabric roll with related mill, type, address, target buyer, and images."""
    return (
        FabricRoll.objects.select_related(
            "factory", "fabric_type", "fabric_type__category", "location_address", "target_buyer"
        )
        .prefetch_related("images")
        .filter(id=roll_id, is_deleted=False)
        .first()
    )


def list_fabric_rolls(
    *,
    search: str | None = None,
    fabric_type: str | None = None,
    category: str | None = None,
    min_gsm: int | None = None,
    max_gsm: int | None = None,
    min_width: float | None = None,
    color: str | None = None,
    min_yards: float | None = None,
    max_price: float | None = None,
    factory_id: str | None = None,
    target_buyer_id: str | None = None,
    custom_only: bool = False,
    buyer_access_id: str | None = None,
    is_owner: bool = False,
) -> QuerySet[FabricRoll]:
    """Filters active surplus rolls and custom fabric profiles."""
    qs = (
        FabricRoll.objects.select_related(
            "factory", "fabric_type", "location_address", "target_buyer"
        )
        .prefetch_related("images")
        .filter(is_deleted=False)
    )

    if factory_id:
        qs = qs.filter(factory_id=factory_id)
        if not is_owner:
            qs = qs.filter(status__in=["ACTIVE", "RESERVED_PARTIAL"], available_yards__gt=0)
            if custom_only and buyer_access_id:
                qs = qs.filter(is_custom_profile=True, target_buyer_id=buyer_access_id)
            elif buyer_access_id:
                qs = qs.filter(Q(target_buyer__isnull=True) | Q(target_buyer_id=buyer_access_id))
            else:
                qs = qs.filter(target_buyer__isnull=True)
        else:
            if target_buyer_id:
                qs = qs.filter(target_buyer_id=target_buyer_id)
            if custom_only:
                qs = qs.filter(is_custom_profile=True)
    else:
        qs = qs.filter(status__in=["ACTIVE", "RESERVED_PARTIAL"], available_yards__gt=0)
        if target_buyer_id:
            qs = qs.filter(target_buyer_id=target_buyer_id)
        elif custom_only and buyer_access_id:
            qs = qs.filter(is_custom_profile=True, target_buyer_id=buyer_access_id)
        elif buyer_access_id:
            # Show public surplus rolls AND custom profiles built specifically for this buyer
            qs = qs.filter(Q(target_buyer__isnull=True) | Q(target_buyer_id=buyer_access_id))
        else:
            # Anonymous / general view: only public rolls
            qs = qs.filter(target_buyer__isnull=True)

    if search:
        qs = (
            qs.filter(title__icontains=search)
            | qs.filter(composition__icontains=search)
            | qs.filter(roll_code__icontains=search)
            | qs.filter(buyer_spec_notes__icontains=search)
        )

    if fabric_type:
        qs = qs.filter(fabric_type__slug=fabric_type)

    if category:
        qs = qs.filter(fabric_type__category__slug=category)

    if min_gsm:
        qs = qs.filter(gsm__gte=min_gsm)

    if max_gsm:
        qs = qs.filter(gsm__lte=max_gsm)

    if min_width:
        qs = qs.filter(width_inches__gte=min_width)

    if color:
        qs = qs.filter(color_name__icontains=color)

    if min_yards:
        qs = qs.filter(available_yards__gte=min_yards)

    if max_price:
        qs = qs.filter(price_per_yard__lte=max_price)

    return qs.order_by("-created_at")


def list_categories() -> QuerySet[FabricCategory]:
    return FabricCategory.objects.prefetch_related("fabric_types").all()
