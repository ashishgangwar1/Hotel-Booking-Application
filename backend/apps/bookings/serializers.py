from rest_framework import serializers

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):

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