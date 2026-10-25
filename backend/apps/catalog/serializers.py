from rest_framework import serializers

from .models import FabricCategory, FabricRoll, FabricRollImage, FabricType


class FabricRollImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FabricRollImage
        fields = ["id", "image_url", "is_primary", "sort_order"]


class FabricTypeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = FabricType
        fields = ["id", "name", "slug", "category_name", "default_gsm_range"]


class FabricCategorySerializer(serializers.ModelSerializer):
    fabric_types = FabricTypeSerializer(many=True, read_only=True)

    class Meta:
        model = FabricCategory
        fields = ["id", "name", "slug", "description", "fabric_types"]


class FabricRollListSerializer(serializers.ModelSerializer):
    mill_name = serializers.CharField(source="factory.name", read_only=True)
    mill_location = serializers.SerializerMethodField()
    fabric_type_name = serializers.CharField(source="fabric_type.name", read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = FabricRoll
        fields = [
            "id",
            "roll_code",
            "title",
            "fabric_type_name",
            "mill_name",
            "mill_location",
            "composition",
            "gsm",
            "width_inches",
            "color_name",
            "color_hex",
            "pattern",
            "finish",
            "available_yards",
            "min_cut_length_yards",
            "price_per_yard",
            "quality_grade",
            "status",
            "is_sample_available",
            "sample_price",
            "primary_image",
            "created_at",
        ]

    def get_mill_location(self, obj):
        if obj.location_address:
            return f"{obj.location_address.district}, {obj.location_address.division}"
        return "Gazipur, Dhaka"

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary:
            return primary.image_url or (primary.image_file.url if primary.image_file else None)
        return None


class FabricRollDetailSerializer(serializers.ModelSerializer):
    mill_name = serializers.CharField(source="factory.name", read_only=True)
    mill_contact_phone = serializers.CharField(source="factory.contact_phone", read_only=True)
    mill_location = serializers.SerializerMethodField()
    fabric_type_name = serializers.CharField(source="fabric_type.name", read_only=True)
    category_name = serializers.CharField(source="fabric_type.category.name", read_only=True)
    images = FabricRollImageSerializer(many=True, read_only=True)

    class Meta:
        model = FabricRoll
        fields = [
            "id",
            "roll_code",
            "title",
            "category_name",
            "fabric_type_name",
            "mill_name",
            "mill_contact_phone",
            "mill_location",
            "composition",
            "gsm",
            "width_inches",
            "color_name",
            "color_hex",
            "pattern",
            "finish",
            "total_yards",
            "available_yards",
            "min_cut_length_yards",
            "price_per_yard",
            "lot_batch_number",
            "quality_grade",
            "defect_notes",
            "status",
            "is_sample_available",
            "sample_price",
            "images",
            "created_at",
            "updated_at",
        ]

    def get_mill_location(self, obj):
        if obj.location_address:
            return f"{obj.location_address.street_address}, {obj.location_address.district}, {obj.location_address.division}"
        return "Tejgaon / Gazipur RMG Zone, Bangladesh"
