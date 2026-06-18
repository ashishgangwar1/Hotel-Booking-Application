from rest_framework import serializers

from .models import (
    Amenity,
    Hotel,
    RoomType,
    Room,
    HotelImage,
    RoomImage
)


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = "__all__"


class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = "__all__"

class RoomImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = RoomImage
        fields = (
            "id",
            "image"
        )

class RoomSerializer(serializers.ModelSerializer):

    def validate(self, attrs):

        hotel = attrs.get("hotel")
        room_type = attrs.get("room_type")

        if (
            hotel
            and room_type
            and room_type.hotel_id != hotel.id
        ):
            raise serializers.ValidationError(
                "RoomType does not belong to this hotel."
            )

        return attrs

    images = RoomImageSerializer(
        many=True,
        read_only=True
    )

    hotel_name = serializers.CharField(
        source="hotel.name",
        read_only=True
    )

    room_type_name = serializers.CharField(
        source="room_type.name",
        read_only=True
    )

    capacity = serializers.IntegerField(
        source="room_type.capacity",
        read_only=True
    )

    price_per_night = serializers.DecimalField(
        source="room_type.price_per_night",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    owner_username = serializers.CharField(
        source="hotel.owner.username",
        read_only=True
    )

    class Meta:
        model = Room
        fields = (
            "id",
            "room_number",
            "hotel",
            "hotel_name",
            "room_type",
            "room_type_name",
            "capacity",
            "price_per_night",
            "images",
            "owner_username"
        )

class HotelImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = HotelImage
        fields = (
            "id",
            "image",
            "is_primary"
        )

class HotelSerializer(serializers.ModelSerializer):

    amenities = AmenitySerializer(
        many=True,
        read_only=True
    )

    images = HotelImageSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Hotel
        fields = "__all__"