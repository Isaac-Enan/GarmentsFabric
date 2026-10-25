import io
import re
import secrets
import string

import barcode
import qrcode
from barcode.writer import ImageWriter
from django.core.files.base import ContentFile


def normalize_bd_phone(phone: str) -> str:
    """Normalize phone string into +8801XXXXXXXXX format."""
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("8801") and len(digits) == 13:
        return f"+{digits}"
    if digits.startswith("01") and len(digits) == 11:
        return f"+88{digits}"
    if digits.startswith("1") and len(digits) == 10:
        return f"+880{digits}"
    return phone


def generate_reference_code(prefix: str = "REF", length: int = 6) -> str:
    """Generate a clean human-readable reference code like ORD-X7K9P2."""
    alphabet = string.ascii_uppercase + string.digits
    rand = "".join(secrets.choice(alphabet) for _ in range(length))
    return f"{prefix}-{rand}"


def generate_barcode_image(code_value: str) -> ContentFile:
    """Generate a Code128 barcode image file in memory."""
    code128 = barcode.get_barcode_class("code128")
    bar = code128(code_value, writer=ImageWriter())
    buffer = io.BytesIO()
    bar.write(buffer)
    return ContentFile(buffer.getvalue(), name=f"{code_value}.png")


def generate_qr_code_image(data_payload: str) -> ContentFile:
    """Generate a QR Code image in memory."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(data_payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return ContentFile(buffer.getvalue(), name=f"qr_{secrets.token_hex(4)}.png")
