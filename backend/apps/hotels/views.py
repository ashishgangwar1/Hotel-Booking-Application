from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Room
from .serializers import (
    HotelSerializer,
    RoomSerializer,
    RoomTypeSerializer
)

from .services import (
    HotelService
)
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .permissions import IsManagerOrAdmin
from rest_framework.exceptions import PermissionDenied
from .models import (
    Hotel,
    RoomType,
    Room
)
from django.shortcuts import get_object_or_404

class HotelListView(APIView):

    def get(self, request):

        hotels = HotelService.get_all_hotels()

        serializer = HotelSerializer(
            hotels,
            many=True
        )

        return Response(
            serializer.data
        )


class HotelSearchView(APIView):

    def get(self, request):

        city = request.GET.get(
            "city"
        )

        hotels = HotelService.search_hotels(
            city
        )

        serializer = HotelSerializer(
            hotels,
            many=True
        )

        return Response(
            serializer.data
        )
    
class RoomListView(APIView):

    def get(self, request):

        rooms = Room.objects.select_related(
            "hotel",
            "room_type"
        ).prefetch_related(
            "images"
        )

        serializer = RoomSerializer(
            rooms,
            many=True
        )

        return Response(
            serializer.data
        )

class HotelRoomsView(APIView):

    def get(self, request, hotel_id):

        rooms = Room.objects.filter(
            hotel_id=hotel_id
        ).select_related(
            "hotel",
            "room_type"
        ).prefetch_related(
            "images"
        )

        serializer = RoomSerializer(
            rooms,
            many=True
        )

        return Response(
            serializer.data
        )
    
class MyHotelsView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        hotels = HotelService.get_user_hotels(
            request.user
        )

        serializer = HotelSerializer(
            hotels,
            many=True
        )

        return Response(
            serializer.data
        )
    
class CreateHotelView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def post(self, request):

        serializer = HotelSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save(
            owner=request.user
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
    
class UpdateHotelView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def put(
        self,
        request,
        pk
    ):

        hotel = Hotel.objects.get(
            pk=pk
        )

        if hotel.owner != request.user:
            raise PermissionDenied(
                "You do not own this hotel."
            )

        serializer = HotelSerializer(
            hotel,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )
    
class CreateRoomTypeView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def post(self, request):

        serializer = RoomTypeSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        hotel = serializer.validated_data["hotel"]

        if (
            request.user.profile.role != "ADMIN"
            and hotel.owner != request.user
        ):
            raise PermissionDenied(
                "You do not own this hotel."
            )

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
    
class UpdateRoomTypeView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def put(
        self,
        request,
        pk
    ):

        room_type = get_object_or_404(
            RoomType,
            pk=pk
        )

        if (
            request.user.profile.role != "ADMIN"
            and room_type.hotel.owner != request.user
        ):
            raise PermissionDenied(
                "You do not own this hotel."
            )

        serializer = RoomTypeSerializer(
            room_type,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )
    
class DeleteRoomTypeView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def delete(
        self,
        request,
        pk
    ):

        room_type = get_object_or_404(
            RoomType,
            pk=pk
        )

        if (
            request.user.profile.role != "ADMIN"
            and room_type.hotel.owner != request.user
        ):
            raise PermissionDenied(
                "You do not own this hotel."
            )

        room_type.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )