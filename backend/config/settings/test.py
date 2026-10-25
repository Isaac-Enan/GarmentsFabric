import os

import dj_database_url

from .base import *  # noqa: F403

DEBUG = False
TESTING = True

database_url = os.getenv("TEST_DATABASE_URL", "sqlite:///:memory:")
DATABASES = {
    "default": dj_database_url.config(
        default=database_url,
    )
}

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
