from rest_framework import serializers
from .models import WishlistItem


class WishlistItemSerializer(
    serializers.ModelSerializer
):

    hotel_name = serializers.CharField(
        source="hotel.name",
        read_only=True
    )

    class Meta:

        model = WishlistItem

        fields = [
            "id",
            "hotel",
            "hotel_name",
            "created_at"
        ]