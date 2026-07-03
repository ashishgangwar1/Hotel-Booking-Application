from rest_framework.generics import RetrieveAPIView
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
from datetime import datetime, timedelta
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth, TruncWeek
from apps.bookings.models import Booking


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

class HotelDetailView(APIView):

    def get(self, request, pk):

        hotel = get_object_or_404(
            Hotel,
            pk=pk
        )

        serializer = HotelSerializer(hotel)

        return Response(serializer.data)

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
            
        rating = request.query_params.get(
            "rating"
        )

        if rating:
            try:
                rating = float(rating)

                if rating < 0 or rating > 5:
                    return Response(
                        {
                            "error":
                            "rating must be between 0 and 5"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

            except ValueError:
                return Response(
                    {
                        "error":
                        "rating must be a number"
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

class RoomDetailView(RetrieveAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    
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

class RevenueAnalyticsView(APIView):
    """
    Returns revenue analytics for the manager's hotel(s).
    - Monthly/weekly revenue for the past 6 months
    - Revenue per hotel
    - Revenue per room type
    Query params: ?period=monthly|weekly (default: monthly)
    """
    permission_classes = [IsManagerOrAdmin]
 
    def get(self, request):
        period = request.query_params.get("period", "monthly")
 
        # Admin sees all hotels; manager sees only their own
        if request.user.profile.role == "ADMIN":
            hotels = Hotel.objects.all()
        else:
            hotels = Hotel.objects.filter(owner=request.user)
 
        hotel_ids = hotels.values_list("id", flat=True)
 
        # Base queryset: only CONFIRMED or COMPLETED bookings
        base_qs = Booking.objects.filter(
            room__hotel__id__in=hotel_ids,
            status__in=["CONFIRMED", "COMPLETED"]
        )
 
        # --- 1. Revenue over time ---
        six_months_ago = datetime.now() - timedelta(days=180)
        time_qs = base_qs.filter(created_at__gte=six_months_ago)
 
        if period == "weekly":
            time_qs = (
                time_qs
                .annotate(period=TruncWeek("created_at"))
                .values("period")
                .annotate(revenue=Sum("total_amount"))
                .order_by("period")
            )
        else:
            time_qs = (
                time_qs
                .annotate(period=TruncMonth("created_at"))
                .values("period")
                .annotate(revenue=Sum("total_amount"))
                .order_by("period")
            )
 
        revenue_over_time = [
            {
                "period": item["period"].strftime(
                    "%b %Y" if period == "monthly" else "%d %b %Y"
                ),
                "revenue": float(item["revenue"] or 0),
            }
            for item in time_qs
        ]
 
        # --- 2. Revenue per hotel ---
        revenue_per_hotel = (
            base_qs
            .values("room__hotel__name")
            .annotate(revenue=Sum("total_amount"))
            .order_by("-revenue")
        )
        revenue_per_hotel_data = [
            {
                "hotel": item["room__hotel__name"],
                "revenue": float(item["revenue"] or 0),
            }
            for item in revenue_per_hotel
        ]
 
        # --- 3. Revenue per room type ---
        revenue_per_room_type = (
            base_qs
            .values("room__room_type__name")
            .annotate(revenue=Sum("total_amount"))
            .order_by("-revenue")
        )
        revenue_per_room_type_data = [
        {
            "room_type": item["room__room_type__name"] or "Unknown",
            "revenue": float(item["revenue"] or 0),
        }
        for item in revenue_per_room_type
        ]
 
        # --- 4. Summary stats ---
        total_revenue = base_qs.aggregate(
            total=Sum("total_amount")
        )["total"] or 0
 
        total_bookings = base_qs.count()
 
        avg_booking_value = base_qs.aggregate(
            avg=Avg("total_amount")
        )["avg"] or 0
 
        return Response({
            "summary": {
                "total_revenue": float(total_revenue),
                "total_bookings": total_bookings,
                "avg_booking_value": round(float(avg_booking_value), 2),
            },
            "revenue_over_time": revenue_over_time,
            "revenue_per_hotel": revenue_per_hotel_data,
            "revenue_per_room_type": revenue_per_room_type_data,
        })
 
 
class OccupancyAnalyticsView(APIView):
    """
    Returns occupancy analytics for the manager's hotel(s).
    - Occupancy rate per hotel (% of rooms booked today)
    - Occupancy trends over past 6 months
    - Room-wise occupancy breakdown
    """
    permission_classes = [IsManagerOrAdmin]
 
    def get(self, request):
        today = datetime.now().date()
        six_months_ago = today - timedelta(days=180)
 
        if request.user.profile.role == "ADMIN":
            hotels = Hotel.objects.all()
        else:
            hotels = Hotel.objects.filter(owner=request.user)
 
        hotel_ids = hotels.values_list("id", flat=True)
 
        base_qs = Booking.objects.filter(
            room__hotel__id__in=hotel_ids,
            status__in=["CONFIRMED", "COMPLETED"]
        )
 
        # --- 1. Occupancy rate per hotel (currently checked-in) ---
        occupancy_per_hotel = []
        for hotel in hotels:
            total_rooms = Room.objects.filter(
                 hotel=hotel
            ).count()
 
            active_bookings = Booking.objects.filter(
                room__hotel=hotel,
                status__in=["CONFIRMED", "COMPLETED"],
                check_in__lte=today,
                check_out__gte=today,
            ).count()
 
            occupancy_rate = (
                round((active_bookings / total_rooms) * 100, 1)
                if total_rooms > 0 else 0
            )
 
            occupancy_per_hotel.append({
                "hotel": hotel.name,
                "total_rooms": total_rooms,
                "occupied_rooms": active_bookings,
                "occupancy_rate": occupancy_rate,
            })
 
        # --- 2. Occupancy trend over time (monthly) ---
        trend_qs = (
            base_qs
            .filter(check_in__gte=six_months_ago)
            .annotate(period=TruncMonth("check_in"))
            .values("period")
            .annotate(bookings=Count("id"))
            .order_by("period")
        )
 
        occupancy_trend = [
            {
                "period": item["period"].strftime("%b %Y"),
                "bookings": item["bookings"],
            }
            for item in trend_qs
        ]
 
        # --- 3. Room-wise occupancy breakdown ---
        room_occupancy = (
            base_qs
            .filter(check_in__lte=today, check_out__gte=today)
            .values("room__room_type__name", "room__hotel__name")
            .annotate(occupied=Count("id"))
            .order_by("-occupied")
        )
 
        room_occupancy_data = [
            {
                "room_type": item["room__room_type__name"] or "Unknown",
                "hotel": item["room__hotel__name"],
                "occupied": item["occupied"],
            }
            for item in room_occupancy
        ]
 
         # --- 4. Summary ---
        total_rooms_all = Room.objects.filter(
            hotel__id__in=hotel_ids
        ).count()

        currently_occupied = Booking.objects.filter(
            room__hotel__id__in=hotel_ids,
            status__in=["CONFIRMED", "COMPLETED"],
            check_in__lte=today,
            check_out__gte=today,
        ).count()

        overall_occupancy = (
            round((currently_occupied / total_rooms_all) * 100, 1)
            if total_rooms_all > 0 else 0
        )

        return Response({
            "summary": {
                "total_rooms": total_rooms_all,
                "currently_occupied": currently_occupied,
                "overall_occupancy_rate": overall_occupancy,
            },
            "occupancy_per_hotel": occupancy_per_hotel,
            "occupancy_trend": occupancy_trend,
            "room_occupancy_breakdown": room_occupancy_data,
        })

class RoomTypeListView(APIView):
    permission_classes = [IsManagerOrAdmin]

    def get(self, request):
        if request.user.profile.role == "ADMIN":
            room_types = RoomType.objects.all()
        else:
            room_types = RoomType.objects.filter(hotel__owner=request.user)

        hotel_id = request.query_params.get("hotel_id")
        if hotel_id:
            room_types = room_types.filter(hotel_id=hotel_id)

        serializer = RoomTypeSerializer(room_types, many=True)
        return Response(serializer.data)