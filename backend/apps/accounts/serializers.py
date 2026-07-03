from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
from .models import Wishlist, Favorite
from apps.hotels.models import Hotel


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password"
        ]


class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):

    profile = ProfileSerializer(
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "profile"
        ]

class HotelMiniSerializer(serializers.ModelSerializer):
    """Small hotel info for wishlist/favorites"""
    class Meta:
        model = Hotel
        fields = ["id", "name", "city", "rating"]


class WishlistSerializer(serializers.ModelSerializer):
    hotel = HotelMiniSerializer(read_only=True)
    hotel_id = serializers.PrimaryKeyRelatedField(
        queryset=Hotel.objects.all(),
        source="hotel",
        write_only=True
    )

    class Meta:
        model = Wishlist
        fields = ["id", "hotel", "hotel_id", "added_at"]


class FavoriteSerializer(serializers.ModelSerializer):
    hotel = HotelMiniSerializer(read_only=True)
    hotel_id = serializers.PrimaryKeyRelatedField(
        queryset=Hotel.objects.all(),
        source="hotel",
        write_only=True
    )

    class Meta:
        model = Favorite
        fields = ["id", "hotel", "hotel_id", "added_at"]