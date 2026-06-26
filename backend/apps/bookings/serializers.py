from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):

    room_name = serializers.CharField(
        source="room.room_number",
        read_only=True
    )

    hotel_name = serializers.CharField(
        source="room.hotel.name",
        read_only=True
    )

    payment_method = serializers.CharField(
        write_only=True,
        required=False
    )

    class Meta:
        model = Booking
        fields = "__all__"

        read_only_fields = (
            "id",
            "user",
            "status",
            "created_at",
            "booking_reference",
            "price_per_night",
            "total_amount",
        )