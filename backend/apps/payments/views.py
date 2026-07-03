from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .paypal_service import (
    create_order,
    capture_order
)
from .models import Payment

class PaymentSuccessView(APIView):

    def get(self, request):

        order_id = request.GET.get("token")

        if not order_id:
            return Response(
                {
                    "error": "Missing PayPal token"
                },
                status=400
            )

        try:
            payment = Payment.objects.get(
                paypal_order_id=order_id
            )

        except Payment.DoesNotExist:
            return Response(
                {
                    "error": "Invalid PayPal order id"
                },
                status=404
            )


        return Response({
            "message": "Payment approved by user",
            "order_id": order_id,
            "payment_id": payment.id
        })
    
class CreatePayPalOrderView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        booking_id = request.data.get(
            "booking_id"
        )

        if not booking_id:
            return Response(
                {
                    "error":
                    "booking_id is required"
                },
                status=400
            )

        try:
            payment = Payment.objects.get(
                booking_id=booking_id,
                status=Payment.Status.PENDING
            )

        except Payment.DoesNotExist:
            return Response(
                {
                    "error":
                    "No pending payment found"
                },
                status=404
            )

        order = create_order(payment)

        payment.paypal_order_id = order["id"]

        payment.save()

        return Response(order)

class CapturePayPalOrderView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        order_id = request.data.get(
            "order_id"
        )

        if not order_id:
            return Response(
                {
                    "error":
                    "order_id is required"
                },
                status=400
            )

        try:
            payment = Payment.objects.get(
                paypal_order_id=order_id
            )

        except Payment.DoesNotExist:
            return Response(
                {
                    "error":
                    "Invalid PayPal order id"
                },
                status=404
            )

        try:

            result = capture_order(
                order_id
            )

            capture_id = result[
                "purchase_units"
            ][0][
                "payments"
            ][
                "captures"
            ][0]["id"]

            payment.status = (
                Payment.Status.SUCCESS
            )

            payment.transaction_id = (
                capture_id
            )

            payment.error_message = ""

            payment.save()

            booking = payment.booking

            booking.status = (
                booking.Status.CONFIRMED
            )

            booking.save()

            return Response({
                "success": True,
                "message":
                "Payment captured successfully",
                "capture_id":
                capture_id,
                "result":
                result
            })

        except Exception as e:

            payment.status = (
                Payment.Status.FAILED
            )

            payment.error_message = (
                str(e)
            )

            payment.save()

            return Response(
                {
                    "success": False,
                    "error":
                    "PayPal capture failed",
                    "details":
                    str(e)
                },
                status=400
            )
