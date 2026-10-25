import dj_database_url

from .base import *  # noqa: F403

DEBUG = True

# Parse DATABASE_URL, with local sqlite fallback
database_url = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}")  # noqa: F405
DATABASES = {
    "default": dj_database_url.config(
        default=database_url,
        conn_max_age=600,
        conn_health_checks=True,
    )
}

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
