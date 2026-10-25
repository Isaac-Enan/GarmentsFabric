from django.contrib import admin

from .models import FabricCategory, FabricRoll, FabricRollImage, FabricType


class FabricRollImageInline(admin.TabularInline):
    model = FabricRollImage
    extra = 1


@admin.register(FabricCategory)
class FabricCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(FabricType)
class FabricTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "default_gsm_range")
    list_filter = ("category",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(FabricRoll)
class FabricRollAdmin(admin.ModelAdmin):
    list_display = (
        "roll_code",
        "title",
        "factory",
        "fabric_type",
        "gsm",
        "available_yards",
        "price_per_yard",
        "status",
        "quality_grade",
        "created_at",
    )
    list_filter = ("status", "quality_grade", "fabric_type__category", "fabric_type")
    search_fields = ("roll_code", "title", "composition", "factory__name")
    inlines = [FabricRollImageInline]
