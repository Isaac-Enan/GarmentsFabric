import logging

from .base import BaseSMSProvider

logger = logging.getLogger("fabrilink.sms")


class ConsoleSMSProvider(BaseSMSProvider):
    """Console mock provider for local development and testing."""

    def send_sms(self, phone: str, message: str) -> bool:
        logger.info(f"[SMS MOCK] To: {phone} | Message: {message}")
        print(
            f"\n==================== [SMS MOCK] ====================\nTo: {phone}\nMessage: {message}\n====================================================\n"
        )
        return True
