from django.urls import path

from .views import (
    FabricCategoryListView,
    FabricRollDetailView,
    FabricRollListView,
)

app_name = "catalog"

urlpatterns = [
    path("categories/", FabricCategoryListView.as_view(), name="category_list"),
    path("rolls/", FabricRollListView.as_view(), name="roll_list"),
    path("rolls/<uuid:roll_id>/", FabricRollDetailView.as_view(), name="roll_detail"),
]
