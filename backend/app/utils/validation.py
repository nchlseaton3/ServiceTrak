from datetime import date
from decimal import Decimal, InvalidOperation


def parse_date(value):
    if not value:
        return None
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        return None


def parse_non_negative_int(value):
    if value in (None, ""):
        return None
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return None
    return parsed if parsed >= 0 else None


def parse_non_negative_decimal(value):
    if value in (None, ""):
        return None
    try:
        parsed = Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None
    return parsed if parsed >= 0 else None


def normalize_vin(value):
    vin = (value or "").strip().upper()
    if not vin:
        return None
    return vin if len(vin) == 17 else None
