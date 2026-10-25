from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    TokenRefreshCookieView,
)

app_name = "users"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshCookieView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("profile/", MeView.as_view(), name="profile"),
]
