from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


def health_check(request):
    return JsonResponse({"status": "healthy", "service": "fabrilink-backend", "version": "1.0.0"})


api_v1_patterns = [
    path("auth/", include("apps.users.urls", namespace="auth")),
    path("companies/", include("apps.companies.urls", namespace="companies")),
    path("catalog/", include("apps.catalog.urls", namespace="catalog")),
    path("inventory/", include("apps.inventory.urls", namespace="inventory")),
    path("orders/", include("apps.orders.urls", namespace="orders")),
    path("hub/", include("apps.hub.urls", namespace="hub")),
    path("shipping/", include("apps.shipping.urls", namespace="shipping")),
    path("payments/", include("apps.payments.urls", namespace="payments")),
    path("matching/", include("apps.matching.urls", namespace="matching")),
    path("samples/", include("apps.samples.urls", namespace="samples")),
    path("promotions/", include("apps.promotions.urls", namespace="promotions")),
    path("notifications/", include("apps.notifications.urls", namespace="notifications")),
    path("reports/", include("apps.reports.urls", namespace="reports")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health_check"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/v1/", include(api_v1_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
