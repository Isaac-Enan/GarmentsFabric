from django.db.models import QuerySet

from .models import FabricCategory, FabricRoll


def get_fabric_roll_by_id(roll_id: str) -> FabricRoll | None:
    """Retrieves a single fabric roll with related mill, type, address, and images."""
    return (
        FabricRoll.objects.select_related(
            "factory", "fabric_type", "fabric_type__category", "location_address"
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
) -> QuerySet[FabricRoll]:
    """Filters active surplus rolls."""
    qs = (
        FabricRoll.objects.select_related("factory", "fabric_type", "location_address")
        .prefetch_related("images")
        .filter(is_deleted=False)
    )

    if factory_id:
        qs = qs.filter(factory_id=factory_id)
    else:
        qs = qs.filter(status="ACTIVE")

    if search:
        qs = (
            qs.filter(title__icontains=search)
            | qs.filter(composition__icontains=search)
            | qs.filter(roll_code__icontains=search)
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
