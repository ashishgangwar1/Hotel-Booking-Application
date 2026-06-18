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

        serializer.save(
            user=self.request.user
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