from apps.reviews.models import Review
from apps.reviews.serializers import ReviewSerializer
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from apps.bookings.models import Booking

class CreateReviewView(
    generics.CreateAPIView
):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        hotel = serializer.validated_data["hotel"]

        has_booking = Booking.objects.filter(
            user=self.request.user,
            room__hotel=hotel,
            status="COMPLETED"
        ).exists()

        if not has_booking:
            raise ValidationError(
                "You can review only hotels you have stayed in."
            )

        serializer.save(
            user=self.request.user
        )

class HotelReviewListView(
    generics.ListAPIView
):

    serializer_class = ReviewSerializer

    def get_queryset(self):

        return Review.objects.filter(
            hotel_id=self.kwargs["hotel_id"]
        )