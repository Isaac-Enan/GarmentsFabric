from abc import ABC, abstractmethod


class BaseSMSProvider(ABC):
    @abstractmethod
    def send_sms(self, phone: str, message: str) -> bool:
        """Sends an SMS message to a Bangladeshi phone number."""
        pass
