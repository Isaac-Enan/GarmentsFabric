import os

from .base import BaseSMSProvider
from .console import ConsoleSMSProvider


def get_sms_provider() -> BaseSMSProvider:
    provider = os.getenv("SMS_PROVIDER", "console").lower()
    if provider == "console":
        return ConsoleSMSProvider()
    return ConsoleSMSProvider()
