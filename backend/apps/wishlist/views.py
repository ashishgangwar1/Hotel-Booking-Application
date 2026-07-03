from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Wishlist, WishlistItem
from apps.hotels.models import Hotel    
from .serializers import WishlistItemSerializer
from django.shortcuts import get_object_or_404



class AddToWishlistView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        hotel_id = request.data.get(
            "hotel_id"
        )

        hotel = Hotel.objects.get(
            id=hotel_id
        )

        wishlist, _ = (
            Wishlist.objects.get_or_create(
                user=request.user
            )
        )

        WishlistItem.objects.get_or_create(
            wishlist=wishlist,
            hotel=hotel
        )

        return Response(
            {
                "message":
                "Added to wishlist"
            }
        )


class WishlistView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        wishlist, _ = (
            Wishlist.objects.get_or_create(
                user=request.user
            )
        )

        serializer = (
            WishlistItemSerializer(
                wishlist.items.all(),
                many=True
            )
        )

        return Response(
            serializer.data
        )



class RemoveWishlistItemView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(
        self,
        request,
        pk
    ):

        wishlist = get_object_or_404(
            Wishlist,
            user=request.user
        )

        item = get_object_or_404(
            WishlistItem,
            id=pk,
            wishlist=wishlist
        )

        item.delete()

        return Response(
            {
                "message":
                "Removed"
            }
        )