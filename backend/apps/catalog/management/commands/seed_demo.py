from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.catalog.models import FabricCategory, FabricRoll, FabricRollImage, FabricType
from apps.companies.models import (
    AddressTypeChoices,
    Company,
    CompanyAddress,
    CompanyTypeChoices,
    VerificationStatusChoices,
)
from apps.users.models import RoleChoices, User


class Command(BaseCommand):
    help = "Seeds demo factories, buyers, categories, and surplus fabric rolls."

    def handle(self, *args, **options):
        self.stdout.write("Seeding FabriLink demo marketplace data...")

        # 1. Create Superuser / Admin
        admin_user, _ = User.objects.get_or_create(
            email="admin@fabrilink.com.bd",
            defaults={
                "phone": "+8801700000001",
                "role": RoleChoices.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "is_verified": True,
            },
        )
        admin_user.set_password("Admin12345!")
        admin_user.save()

        # 2. Create Garment Factories (Sellers)
        mills = [
            {
                "email": "sales@squarefashions.com",
                "phone": "+8801711000101",
                "name": "Square Fashions Ltd",
                "district": "Gazipur",
                "address": "Kashimpur, Gazipur RMG Zone",
            },
            {
                "email": "surplus@hameemgroup.com",
                "phone": "+8801711000102",
                "name": "Ha-Meem Denim & Knitting Mills",
                "district": "Savar",
                "address": "Ashulia, Savar EPZ Bypass",
            },
            {
                "email": "fabrics@beximcofilaments.com",
                "phone": "+8801711000103",
                "name": "Beximco Textiles Ltd",
                "district": "Dhaka",
                "address": "Sarabo, Kashimpur Road",
            },
        ]

        factories = []
        for m in mills:
            f_user, _ = User.objects.get_or_create(
                email=m["email"],
                defaults={
                    "phone": m["phone"],
                    "role": RoleChoices.FACTORY,
                    "is_verified": True,
                },
            )
            f_user.set_password("Factory12345!")
            f_user.save()

            company, _ = Company.objects.get_or_create(
                user=f_user,
                defaults={
                    "name": m["name"],
                    "company_type": CompanyTypeChoices.FACTORY,
                    "verification_status": VerificationStatusChoices.APPROVED,
                    "trade_license_number": "TRAD-GZ-2024-8891",
                    "tin_number": "1982736451",
                    "contact_email": m["email"],
                    "contact_phone": m["phone"],
                },
            )
            CompanyAddress.objects.get_or_create(
                company=company,
                address_type=AddressTypeChoices.FACTORY_PREMISES,
                defaults={
                    "division": "Dhaka",
                    "district": m["district"],
                    "upazila_thana": m["district"],
                    "street_address": m["address"],
                    "postal_code": "1700",
                    "is_default": True,
                },
            )
            factories.append(company)

        # 3. Create Demo Buyer (Boutique)
        buyer_user, _ = User.objects.get_or_create(
            email="buyer@dhakatrendz.com",
            defaults={
                "phone": "+8801811000201",
                "role": RoleChoices.BUYER,
                "is_verified": True,
            },
        )
        buyer_user.set_password("Buyer12345!")
        buyer_user.save()

        buyer_company, _ = Company.objects.get_or_create(
            user=buyer_user,
            defaults={
                "name": "Dhaka Trendz Boutique",
                "company_type": CompanyTypeChoices.BUYER,
                "verification_status": VerificationStatusChoices.APPROVED,
                "trade_license_number": "TRAD-DK-2025-4120",
                "contact_email": "buyer@dhakatrendz.com",
                "contact_phone": "+8801811000201",
                "credit_limit": Decimal("50000.00"),
            },
        )
        CompanyAddress.objects.get_or_create(
            company=buyer_company,
            address_type=AddressTypeChoices.DELIVERY,
            defaults={
                "division": "Dhaka",
                "district": "Dhaka",
                "upazila_thana": "Banani",
                "street_address": "House 42, Road 11, Block D, Banani",
                "postal_code": "1213",
                "is_default": True,
            },
        )

        # 4. Fabric Categories & Types
        cat_knit, _ = FabricCategory.objects.get_or_create(
            name="Knit Fabrics", defaults={"slug": "knit-fabrics"}
        )
        cat_woven, _ = FabricCategory.objects.get_or_create(
            name="Woven Fabrics", defaults={"slug": "woven-fabrics"}
        )
        cat_denim, _ = FabricCategory.objects.get_or_create(
            name="Denim & Twill", defaults={"slug": "denim-twill"}
        )

        type_jersey, _ = FabricType.objects.get_or_create(
            category=cat_knit,
            name="100% Cotton Single Jersey",
            defaults={"slug": "single-jersey", "default_gsm_range": "160-220"},
        )
        type_french_terry, _ = FabricType.objects.get_or_create(
            category=cat_knit,
            name="French Terry Knit",
            defaults={"slug": "french-terry", "default_gsm_range": "240-320"},
        )
        type_linen, _ = FabricType.objects.get_or_create(
            category=cat_woven,
            name="Pure European Flax Linen",
            defaults={"slug": "pure-linen", "default_gsm_range": "140-180"},
        )
        type_denim, _ = FabricType.objects.get_or_create(
            category=cat_denim,
            name="Stretch Indigo Denim 11.5oz",
            defaults={"slug": "stretch-indigo-denim", "default_gsm_range": "360-420"},
        )

        # 5. Surplus Fabric Rolls
        rolls_data = [
            {
                "factory": factories[0],
                "fabric_type": type_jersey,
                "roll_code": "ROL-2026-CT492",
                "title": "100% Combed Cotton Single Jersey — Navy Blue",
                "composition": "100% Organic Combed Cotton",
                "gsm": 180,
                "width_inches": Decimal("60.00"),
                "color_name": "Deep Navy Blue",
                "color_hex": "#1E3A8A",
                "pattern": "Solid",
                "finish": "Bio-Washed & Silicon Softener",
                "total_yards": Decimal("120.00"),
                "available_yards": Decimal("120.00"),
                "min_cut_length_yards": Decimal("10.00"),
                "price_per_yard": Decimal("240.00"),
                "lot_batch_number": "SQ-2026-B91",
                "quality_grade": "GRADE_A",
                "defect_notes": "Zero knit holes. Export over-make from H&M Autumn program.",
                "image": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
            },
            {
                "factory": factories[1],
                "fabric_type": type_denim,
                "roll_code": "ROL-2026-DN819",
                "title": "Premium Ring Spun Stretch Denim 11.5oz",
                "composition": "98% Cotton 2% Spandex",
                "gsm": 390,
                "width_inches": Decimal("58.00"),
                "color_name": "Dark Indigo Raw",
                "color_hex": "#1E1B4B",
                "pattern": "3/1 Right Hand Twill",
                "finish": "Sanforized & Desized",
                "total_yards": Decimal("85.00"),
                "available_yards": Decimal("85.00"),
                "min_cut_length_yards": Decimal("15.00"),
                "price_per_yard": Decimal("380.00"),
                "lot_batch_number": "HM-DEN-774",
                "quality_grade": "SURPLUS_FRESH",
                "defect_notes": "Intact roll on heavy cardboard core. Levi's export surplus.",
                "image": "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
            },
            {
                "factory": factories[2],
                "fabric_type": type_linen,
                "roll_code": "ROL-2026-LN301",
                "title": "Pure Washed Flax Linen Plain Weave — Oatmeal",
                "composition": "100% Pure Flax Linen",
                "gsm": 165,
                "width_inches": Decimal("54.00"),
                "color_name": "Natural Oatmeal",
                "color_hex": "#E5E0D8",
                "pattern": "Plain Weave",
                "finish": "Aero-Washed Soft Drape",
                "total_yards": Decimal("60.00"),
                "available_yards": Decimal("60.00"),
                "min_cut_length_yards": Decimal("5.00"),
                "price_per_yard": Decimal("520.00"),
                "lot_batch_number": "BX-LIN-302",
                "quality_grade": "GRADE_A",
                "defect_notes": "Slub texture natural. Zara Men's resort collection balance.",
                "image": "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80",
            },
            {
                "factory": factories[0],
                "fabric_type": type_french_terry,
                "roll_code": "ROL-2026-FT610",
                "title": "Brushed Back Heavy French Terry — Heather Grey",
                "composition": "85% Cotton 15% Polyester",
                "gsm": 310,
                "width_inches": Decimal("62.00"),
                "color_name": "Melange Heather Grey",
                "color_hex": "#9CA3AF",
                "pattern": "Loopback Terry",
                "finish": "Carbonized Anti-Pilling",
                "total_yards": Decimal("95.00"),
                "available_yards": Decimal("95.00"),
                "min_cut_length_yards": Decimal("10.00"),
                "price_per_yard": Decimal("310.00"),
                "lot_batch_number": "SQ-FT-118",
                "quality_grade": "GRADE_A",
                "defect_notes": "Uniform loop height. Primark hoodie surplus.",
                "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
            },
        ]

        for r in rolls_data:
            image_url = r.pop("image")
            roll, created = FabricRoll.objects.get_or_create(
                roll_code=r["roll_code"],
                defaults=r,
            )
            FabricRollImage.objects.get_or_create(
                fabric_roll=roll,
                image_url=image_url,
                defaults={"is_primary": True, "sort_order": 0},
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded FabriLink demo catalog & mills!"))
