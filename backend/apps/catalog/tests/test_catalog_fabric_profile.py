import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.catalog.models import FabricCategory, FabricRoll, FabricType
from apps.companies.models import Company, CompanyTypeChoices, VerificationStatusChoices
from apps.users.models import RoleChoices, User


@pytest.fixture
def factory_user(db):
    user = User.objects.create_user(
        email="factory_merchandiser@test.com",
        phone="+8801711000111",
        password="TestPassword123!",
        role=RoleChoices.FACTORY,
    )
    company = Company.objects.create(
        user=user,
        name="Apex Textile Mills",
        company_type=CompanyTypeChoices.FACTORY,
        verification_status=VerificationStatusChoices.APPROVED,
        contact_email="factory_merchandiser@test.com",
        contact_phone="+8801711000111",
    )
    return user, company


@pytest.fixture
def buyer_user(db):
    user = User.objects.create_user(
        email="boutique_buyer@test.com",
        phone="+8801711000222",
        password="TestPassword123!",
        role=RoleChoices.BUYER,
    )
    company = Company.objects.create(
        user=user,
        name="Dhaka Trendz Boutique",
        company_type=CompanyTypeChoices.BUYER,
        verification_status=VerificationStatusChoices.APPROVED,
        contact_email="boutique_buyer@test.com",
        contact_phone="+8801711000222",
    )
    return user, company


@pytest.fixture
def other_buyer_user(db):
    user = User.objects.create_user(
        email="chittagong_fashion@test.com",
        phone="+8801711000333",
        password="TestPassword123!",
        role=RoleChoices.BUYER,
    )
    company = Company.objects.create(
        user=user,
        name="Chittagong Fashion Hub",
        company_type=CompanyTypeChoices.BUYER,
        verification_status=VerificationStatusChoices.APPROVED,
        contact_email="chittagong_fashion@test.com",
        contact_phone="+8801711000333",
    )
    return user, company


@pytest.fixture
def fabric_type(db):
    category = FabricCategory.objects.create(name="Knit Fabrics", slug="knit-fabrics")
    return FabricType.objects.create(
        category=category,
        name="Single Jersey",
        slug="single-jersey",
        default_gsm_range="160-200",
    )


@pytest.mark.django_db
class TestFactoryBuildFabricProfileForBuyer:
    def test_factory_user_can_build_fabric_profile_for_buyer(
        self, factory_user, buyer_user, fabric_type
    ):
        f_user, f_company = factory_user
        b_user, b_company = buyer_user

        client = APIClient()
        client.force_authenticate(user=f_user)

        payload = {
            "title": "Custom Organic Cotton Single Jersey - Exclusive Capsule",
            "fabric_type": str(fabric_type.id),
            "composition": "100% Organic Combed Cotton",
            "gsm": 180,
            "width_inches": "62.00",
            "color_name": "Sage Green",
            "color_hex": "#8A9A86",
            "pattern": "Solid",
            "finish": "Bio-Washed Peach Finish",
            "total_yards": "150.00",
            "available_yards": "150.00",
            "min_cut_length_yards": "10.00",
            "price_per_yard": "320.00",
            "quality_grade": "GRADE_A",
            "target_buyer_id": str(b_company.id),
            "is_custom_profile": True,
            "buyer_spec_notes": "Tailored for Dhaka Trendz Eid Capsule 2026. GOTS Certified organic yarn.",
        }

        response = client.post("/api/v1/catalog/rolls/", payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        data = response.data["data"]
        assert data["title"] == payload["title"]
        assert data["is_custom_profile"] is True
        assert data["target_buyer_id"] == str(b_company.id)
        assert data["target_buyer_name"] == "Dhaka Trendz Boutique"
        assert "GOTS Certified" in data["buyer_spec_notes"]

        # Verify in database
        roll = FabricRoll.objects.get(id=data["id"])
        assert roll.target_buyer == b_company
        assert roll.is_custom_profile is True
        assert roll.factory == f_company

    def test_buyer_can_view_exclusive_custom_profile_built_for_them(
        self, factory_user, buyer_user, other_buyer_user, fabric_type
    ):
        f_user, f_company = factory_user
        b_user, b_company = buyer_user
        other_user, other_company = other_buyer_user

        # Create custom roll built for b_company
        custom_roll = FabricRoll.objects.create(
            factory=f_company,
            roll_code="ROL-CUSTOM-01",
            fabric_type=fabric_type,
            title="Exclusive Lavender Pima Cotton",
            composition="100% Pima Cotton",
            gsm=190,
            width_inches=60.0,
            color_name="Lavender Mist",
            color_hex="#E6E6FA",
            total_yards=100.0,
            available_yards=100.0,
            price_per_yard=350.0,
            target_buyer=b_company,
            is_custom_profile=True,
            buyer_spec_notes="Exclusive for Dhaka Trendz.",
        )

        # Buyer 1 checks their custom profiles
        client_b1 = APIClient()
        client_b1.force_authenticate(user=b_user)
        res_b1 = client_b1.get("/api/v1/catalog/rolls/?custom_only=true")
        assert res_b1.status_code == status.HTTP_200_OK
        ids = [item["id"] for item in res_b1.data["data"]]
        assert str(custom_roll.id) in ids

        # Buyer 2 checks their custom profiles - should NOT see Buyer 1's profile
        client_b2 = APIClient()
        client_b2.force_authenticate(user=other_user)
        res_b2 = client_b2.get("/api/v1/catalog/rolls/?custom_only=true")
        assert res_b2.status_code == status.HTTP_200_OK
        ids_b2 = [item["id"] for item in res_b2.data["data"]]
        assert str(custom_roll.id) not in ids_b2

        # Anonymous public catalog browse should NOT see private custom profile
        client_anon = APIClient()
        res_anon = client_anon.get("/api/v1/catalog/rolls/")
        assert res_anon.status_code == status.HTTP_200_OK
        ids_anon = [item["id"] for item in res_anon.data["data"]]
        assert str(custom_roll.id) not in ids_anon

    def test_factory_can_list_registered_buyers_to_select(self, factory_user, buyer_user):
        f_user, _ = factory_user
        _, b_company = buyer_user

        client = APIClient()
        client.force_authenticate(user=f_user)

        res = client.get("/api/v1/companies/buyers/")
        assert res.status_code == status.HTTP_200_OK
        buyers = res.data["data"]
        buyer_ids = [b["id"] for b in buyers]
        assert str(b_company.id) in buyer_ids
