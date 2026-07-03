import uuid


def generate_booking_reference():
    return f"HB{uuid.uuid4().hex[:10].upper()}"