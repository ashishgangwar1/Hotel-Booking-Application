from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import Booking
from .serializers import BookingSerializer

from apps.hotels.models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Booking

class CreateBookingView(generics.CreateAPIView):

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        room = serializer.validated_data["room"]

        check_in = serializer.validated_data["check_in"]
        check_out = serializer.validated_data["check_out"]

        if check_in >= check_out:
            raise ValidationError(
                "Check-out must be after check-in."
            )

        if not room.is_available:
            raise ValidationError(
                "Room is not available."
            )

        overlap = Booking.objects.filter(
            room=room,
            status="CONFIRMED",
            check_in__lt=check_out,
            check_out__gt=check_in
        ).exists()

        if overlap:
            raise ValidationError(
                "Room already booked for selected dates."
            )

        serializer.save(
            user=self.request.user
        )

class MyBookingsView(generics.ListAPIView):

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        )
    
class CancelBookingView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        booking = Booking.objects.get(
            pk=pk,
            user=request.user
        )

        booking.status = "CANCELLED"
        booking.save()

        return Response(
            {"message": "Booking cancelled"},
            status=status.HTTP_200_OK
        )