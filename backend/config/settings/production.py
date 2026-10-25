import os

import dj_database_url

from .base import *  # noqa: F403

DEBUG = False

DATABASES = {
    "default": dj_database_url.config(
        default=os.getenv("DATABASE_URL"),  # noqa: F405
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Production Security
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "True").lower() in ("true", "1")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# S3 Storage if enabled
if os.getenv("USE_S3", "False").lower() in ("true", "1"):
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3.S3Storage",
            "OPTIONS": {
                "access_key": os.getenv("AWS_ACCESS_KEY_ID"),  # noqa: F405
                "secret_key": os.getenv("AWS_SECRET_ACCESS_KEY"),  # noqa: F405
                "bucket_name": os.getenv("AWS_STORAGE_BUCKET_NAME"),  # noqa: F405
                "region_name": os.getenv("AWS_S3_REGION_NAME", "ap-south-1"),  # noqa: F405
            },
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
