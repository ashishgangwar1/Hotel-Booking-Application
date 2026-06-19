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
from apps.accounts.models import UserRole
from rest_framework import status
from datetime import datetime

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

    ALLOWED_FILTERS = {
        "city",
        "rating",
        "amenity",
        "min_price",
        "max_price",
        "room_type",
        "guests",
        "check_in",
        "check_out"
    }

    def get(self, request):

        invalid = (
            set(request.query_params.keys())
            - self.ALLOWED_FILTERS
        )

        if invalid:
            return Response(
                {
                    "error": (
                        f"Invalid filters: "
                        f"{', '.join(invalid)}"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        check_in = request.query_params.get(
            "check_in"
        )

        check_out = request.query_params.get(
            "check_out"
        )

        if (
            (check_in and not check_out)
            or
            (check_out and not check_in)
        ):
            return Response(
                {
                    "error":
                    "check_in and check_out must be provided together"
                },
                status=status.HTTP_400_BAD_REQUEST
            )  

        if check_in and check_out:

            try:
                check_in_date = datetime.strptime(
                    check_in,
                    "%Y-%m-%d"
                ).date()

                check_out_date = datetime.strptime(
                    check_out,
                    "%Y-%m-%d"
                ).date()

            except ValueError:
                return Response(
                    {
                        "error":
                        "Date format must be YYYY-MM-DD"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        if rating:
            rating = float(rating)

            if rating < 0 or rating > 5:
                return Response(
                    {
                        "error":
                        "rating must be between 0 and 5"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        hotels = HotelService.search_hotels(
            request.query_params
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

    # permission_classes = [
    #     IsAuthenticated
    # ]
    permission_classes = [
        IsManagerOrAdmin
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

        # hotel = Hotel.objects.get(
        #     pk=pk
        # )
        hotel = get_object_or_404(
            Hotel,
            pk=pk
        )

        # if hotel.owner != request.user:
        #     raise PermissionDenied(
        #         "You do not own this hotel."
        #     )
        if (
            request.user.profile.role != "ADMIN"
            and hotel.owner != request.user
        ):
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
    
class DeleteHotelView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def delete(
        self,
        request,
        pk
    ):

        hotel = get_object_or_404(
            Hotel,
            pk=pk
        )

        if (
            request.user.profile.role != "ADMIN"
            and hotel.owner != request.user
        ):
            raise PermissionDenied(
                "You do not own this hotel."
            )

        hotel.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
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
    
class CreateRoomView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def post(self, request):

        serializer = RoomSerializer(
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
    
class UpdateRoomView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def put(
        self,
        request,
        pk
    ):

        room = get_object_or_404(
            Room,
            pk=pk
        )

        if (
            request.user.profile.role != "ADMIN"
            and room.hotel.owner != request.user
        ):
            raise PermissionDenied(
                "You do not own this hotel."
            )

        serializer = RoomSerializer(
            room,
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
    
class DeleteRoomView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def delete(
        self,
        request,
        pk
    ):

        room = get_object_or_404(
            Room,
            pk=pk
        )

        if (
            request.user.profile.role != "ADMIN"
            and room.hotel.owner != request.user
        ):
            raise PermissionDenied(
                "You do not own this hotel."
            )

        room.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )
    
class ManagerRoomListView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def get(self, request):

        # rooms = Room.objects.filter(
        #     hotel__owner=request.user
        # ).select_related(
        #     "hotel",
        #     "room_type"
        # )
        # if request.user.profile.role == "ADMIN":
        if request.user.profile.role == UserRole.ADMIN:
            rooms = Room.objects.all()
        else:
            rooms = Room.objects.filter(
                hotel__owner=request.user
            )

        rooms = rooms.select_related(
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