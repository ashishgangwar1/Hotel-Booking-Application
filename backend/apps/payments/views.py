from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Payment

class PaymentSuccessView(APIView):

    def post(self, request):

        # payment = Payment.objects.get(
        #     transaction_id=request.data["transaction_id"]
        # )
        try:
            payment = Payment.objects.get(
                transaction_id=request.data["transaction_id"]
            )
        except Payment.DoesNotExist:
            return Response(
                {
                    "error": "Invalid transaction id"
                },
                status=404
            )
        if payment.status == "SUCCESS":
            return Response(
                {
                    "message":
                    "Payment already completed"
                },
                status=400
            )
        payment.status = "SUCCESS"
        payment.save()

        if payment.payment_method == "ONLINE":

            booking = payment.booking

            booking.status = "CONFIRMED"

            booking.save()

        return Response({
            "message": "Payment successful"
        })
        # if payment.status == "SUCCESS":
        #     return Response({
        #         "message": "Payment successful"
        #     })