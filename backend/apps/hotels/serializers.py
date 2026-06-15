from rest_framework import serializers

from .models import (
    Amenity,
    Hotel,
    RoomType,
    Room
)


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = "__all__"


class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = "__all__"


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = "__all__"


class HotelSerializer(serializers.ModelSerializer):

    amenities = AmenitySerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Hotel
        fields = "__all__"