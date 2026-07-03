from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import Booking
from .serializers import BookingSerializer
from apps.accounts.permissions import IsManagerOrAdmin
from apps.hotels.models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Booking
from .availability_service import AvailabilityService
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.db.models import Sum
from apps.hotels.models import Hotel, Room
from apps.payments.services import create_payment
from django.utils import timezone
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone

class CreateBookingView(generics.CreateAPIView):

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        room = serializer.validated_data["room"]
        
        guests = serializer.validated_data["guests"]

        if guests > room.room_type.capacity:
            raise ValidationError(
                f"Maximum {room.room_type.capacity} guests allowed."
            )

        check_in = serializer.validated_data["check_in"]
        check_out = serializer.validated_data["check_out"]

        if check_in >= check_out:
            raise ValidationError(
                "Check-out must be after check-in."
            )

        if not AvailabilityService.is_room_available(
            room,
            check_in,
            check_out
        ):
            raise ValidationError(
                "Room already booked for selected dates."
            )

        # serializer.save(
        #     user=self.request.user
        # )
        payment_method = serializer.validated_data.pop(
            "payment_method"
        )

        booking = serializer.save(
            user=self.request.user
        )

        create_payment(
            booking,
            payment_method
        )
        
class MyBookingsView(generics.ListAPIView):

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        )
    
class CancelBookingView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        booking = get_object_or_404(
            Booking,
            pk=pk,
            user=request.user
        )

        booking.status = "CANCELLED"
        booking.save()

        return Response(
            {"message": "Booking cancelled"},
            status=status.HTTP_200_OK
        )
    
class ManagerBookingsView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def get(self, request):

        bookings = Booking.objects.filter(
            room__hotel__owner=request.user
        ).select_related(
            "user",
            "room",
            "room__hotel"
        )

        serializer = BookingSerializer(
            bookings,
            many=True
        )

        return Response(
            serializer.data
        )
    
class ApproveBookingView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def post(self, request, pk):

        booking = get_object_or_404(
            Booking,
            pk=pk
        )

        if (
            request.user.profile.role != "ADMIN"
            and booking.room.hotel.owner != request.user
        ):
            raise PermissionDenied()
        if booking.payment.payment_method == "ONLINE":
            return Response(
                {
                    "error":
                    "Online bookings are auto confirmed."
                },
                status=400
            )
        booking.status = "CONFIRMED"
        booking.approved_by = request.user
        booking.approved_at = timezone.now()
        booking.save()

        return Response(
            {"message": "Booking approved"}
        )
    
class RejectBookingView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def post(self, request, pk):

        booking = get_object_or_404(
            Booking,
            pk=pk
        )

        if (
            request.user.profile.role != "ADMIN"
            and booking.room.hotel.owner != request.user
        ):
            raise PermissionDenied()

        booking.status = "REJECTED"
        booking.rejected_by = request.user
        booking.rejected_at = timezone.now()
        booking.save()

        return Response(
            {"message": "Booking rejected"}
        )
    
class CompleteBookingView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def post(self, request, pk):

        booking = get_object_or_404(
            Booking,
            pk=pk
        )

        if (
            request.user.profile.role != "ADMIN"
            and booking.room.hotel.owner != request.user
        ):
            raise PermissionDenied()

        booking.status = "COMPLETED"
        booking.completed_by = request.user
        booking.completed_at = timezone.now()
        booking.save()

        return Response(
            {"message": "Booking completed"}
        )

class ManagerDashboardView(APIView):

    permission_classes = [IsManagerOrAdmin]

    def get(self, request):

        hotels = Hotel.objects.filter(
            owner=request.user
        )

        rooms = Room.objects.filter(
            hotel__owner=request.user
        )

        bookings = Booking.objects.filter(
            room__hotel__owner=request.user
        )

        data = {
            "total_hotels": hotels.count(),
            "total_rooms": rooms.count(),
            "total_bookings": bookings.count(),
            "pending_bookings":
                bookings.filter(
                    status="PENDING"
                ).count(),

            "confirmed_bookings":
                bookings.filter(
                    status="CONFIRMED"
                ).count(),

            "completed_bookings":
                bookings.filter(
                    status="COMPLETED"
                ).count(),

            "total_revenue":
                bookings.filter(
                    status="COMPLETED"
                ).aggregate(
                    total=Sum("total_amount")
                )["total"] or 0
        }

        return Response(data)
    
class MyBookingDetailView(
    generics.RetrieveAPIView
):

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Booking.objects.filter(
            user=self.request.user
        )
    
class BookingHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        history_type = request.GET.get("type")

        today = timezone.now().date()

        bookings = Booking.objects.filter(
            user=request.user
        )

        if history_type == "upcoming":

            bookings = bookings.filter(
                check_in__gte=today
            ).exclude(
                status__in=[
                    "CANCELLED",
                    "REFUNDED"
                ]
            )

        elif history_type == "past":

            bookings = bookings.filter(
                check_out__lt=today
            )

        elif history_type == "cancelled":

            bookings = bookings.filter(
                status="CANCELLED"
            )

        elif history_type == "refunded":

            bookings = bookings.filter(
                status="REFUNDED"
            )

        bookings = bookings.order_by(
            "-created_at"
        )
        
        serializer = BookingSerializer(
            bookings,
            many=True
        )

        return Response(serializer.data)
    
class RevenueAnalyticsView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def get(self, request):

        bookings = Booking.objects.filter(
            room__hotel__owner=request.user,
            status="COMPLETED"
        )

        total_revenue = (
            bookings.aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        monthly_revenue = (
            bookings
            .annotate(
                month=TruncMonth("created_at")
            )
            .values("month")
            .annotate(
                revenue=Sum("total_amount")
            )
            .order_by("month")
        )

        hotel_revenue = (
            bookings
            .values(
                "room__hotel__name"
            )
            .annotate(
                revenue=Sum("total_amount")
            )
        )

        return Response({
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "hotel_revenue": hotel_revenue
        })
    
class OccupancyAnalyticsView(APIView):

    permission_classes = [
        IsManagerOrAdmin
    ]

    def get(self, request):

        today = timezone.now().date()

        total_rooms = Room.objects.filter(
            hotel__owner=request.user
        ).count()

        occupied_rooms = Room.objects.filter(
            hotel__owner=request.user,
            bookings__status__in=[
                "CONFIRMED",
                "COMPLETED"
            ],
            bookings__check_in__lte=today,
            bookings__check_out__gt=today
        ).distinct().count()

        available_rooms = (
            total_rooms - occupied_rooms
        )

        occupancy_rate = (
            occupied_rooms / total_rooms * 100
            if total_rooms > 0
            else 0
        )

        return Response({
            "total_rooms": total_rooms,
            "occupied_rooms": occupied_rooms,
            "available_rooms": available_rooms,
            "occupancy_rate": round(
                occupancy_rate,
                2
            )
        })