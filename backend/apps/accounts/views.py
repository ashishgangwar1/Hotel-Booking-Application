from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    WishlistSerializer, 
    FavoriteSerializer
)

from .services import AccountService
from .models import Wishlist, Favorite


class RegisterView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = AccountService.register_user(
            username=serializer.validated_data["username"],
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"]
        )

        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
        })


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all wishlist items for logged in user"""
        wishlists = Wishlist.objects.filter(
            user=request.user
        ).select_related("hotel")
        serializer = WishlistSerializer(wishlists, many=True)
        return Response(serializer.data)

    def post(self, request):
        from apps.hotels.models import Hotel

        hotel_id = request.data.get("hotel_id")

        if not hotel_id:
            return Response(
                {"message": "hotel_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            hotel = Hotel.objects.get(id=hotel_id)
        except Hotel.DoesNotExist:
            return Response(
                {"message": "Hotel not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user,
            hotel=hotel
        )

        if not created:
            return Response(
                {"message": "Already in wishlist"},
                status=status.HTTP_200_OK
            )

        return Response(
            WishlistSerializer(wishlist).data,
            status=status.HTTP_201_CREATED
        )


class WishlistDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, hotel_id):
        """Remove a hotel from wishlist"""
        try:
            wishlist = Wishlist.objects.get(
                user=request.user,
                hotel_id=hotel_id
            )
            wishlist.delete()
            return Response(
                {"message": "Removed from wishlist"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Wishlist.DoesNotExist:
            return Response(
                {"message": "Not found in wishlist"},
                status=status.HTTP_404_NOT_FOUND
            )


class FavoriteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all favorite hotels for logged in user"""
        favorites = Favorite.objects.filter(
            user=request.user
        ).select_related("hotel")
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Add a hotel to favorites"""
        serializer = FavoriteSerializer(data=request.data)
        if serializer.is_valid():
            favorite, created = Favorite.objects.get_or_create(
                user=request.user,
                hotel=serializer.validated_data["hotel"]
            )
            if not created:
                return Response(
                    {"message": "Already in favorites"},
                    status=status.HTTP_200_OK
                )
            return Response(
                FavoriteSerializer(favorite).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class FavoriteDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, hotel_id):
        """Remove a hotel from favorites"""
        try:
            favorite = Favorite.objects.get(
                user=request.user,
                hotel_id=hotel_id
            )
            favorite.delete()
            return Response(
                {"message": "Removed from favorites"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Favorite.DoesNotExist:
            return Response(
                {"message": "Not found in favorites"},
                status=status.HTTP_404_NOT_FOUND
            )