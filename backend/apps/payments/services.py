from .models import Payment


def create_payment(
    booking,
    payment_method
):

    return Payment.objects.create(
        booking=booking,
        amount=booking.total_amount,
        payment_method=payment_method,
        transaction_id = (
            f"TXN-{booking.id}"
            if payment_method == "ONLINE"
            else None
        ),
        status="PENDING"
    )