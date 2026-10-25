from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

from common.models import TimeStampedModel, UUIDModel


class UserManager(BaseUserManager):
    """Custom manager for FabriLink user model using email as unique identifier."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", RoleChoices.ADMIN)
        extra_fields.setdefault("is_verified", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class RoleChoices(models.TextChoices):
    FACTORY = "FACTORY", "Garment Factory (Seller)"
    BUYER = "BUYER", "Boutique / Brand / Startup (Buyer)"
    HUB_STAFF = "HUB_STAFF", "FabriLink Hub Staff"
    ADMIN = "ADMIN", "Central Admin"


class User(AbstractBaseUser, PermissionsMixin, UUIDModel, TimeStampedModel):
    """Custom User model with role-based access and phone/email."""

    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=RoleChoices.choices, default=RoleChoices.BUYER)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["phone", "role"]

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


class UserProfile(UUIDModel, TimeStampedModel):
    """Extended user profile information."""

    LANGUAGE_CHOICES = (
        ("bn", "Bangla"),
        ("en", "English"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    preferred_language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default="bn")

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return f"Profile of {self.user.email}"

    @property
    def full_name(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name if name else self.user.email
