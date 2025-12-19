from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db.models import Q
from django.contrib.auth.models import User # For RegisterView
from .permissions import IsHotelManagerOrReadOnly
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from django.utils import timezone

from .models import Hotel, Room, Booking
from .serializers import (
    HotelSerializer, 
    RoomSerializer, 
    BookingSerializer, 
    RegisterSerializer
)

# --- PUBLIC VIEWS (Search and Hotel/Room Details) ---

class HotelViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Handles read-only operations for Hotel objects and includes search action.
    """
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer
    permission_classes = [permissions.AllowAny] # Publicly accessible

    # Custom action to handle search by dates and city: /api/hotels/search/?...
    @action(detail=False, methods=['get'])
    def search(self, request):
        check_in_str = request.query_params.get('check_in')
        check_out_str = request.query_params.get('check_out')
        city = request.query_params.get('city')
        
        # 1. Basic Validation
        if not check_in_str or not check_out_str:
             return Response({"error": "Check-in and check-out dates are required."}, status=status.HTTP_400_BAD_REQUEST)

        hotels_qs = Hotel.objects.all()
        if city:
            hotels_qs = hotels_qs.filter(city__icontains=city) 
        
        # 2. Find Rooms that are ALREADY BOOKED for the requested period
        overlapping_bookings = Booking.objects.filter(
            check_in_date__lt=check_out_str,
            check_out_date__gt=check_in_str
        ).values_list('room_id', flat=True)

        # 3. Find AVAILABLE Rooms
        available_rooms = Room.objects.filter(
            hotel__in=hotels_qs
        ).exclude(
            id__in=overlapping_bookings
        ).distinct()

        serializer = RoomSerializer(available_rooms, many=True)
        return Response(serializer.data)

    
    # VVVV NEW ACTION FOR MANAGER DASHBOARD VVVV
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_hotel(self, request):
        """
        Endpoint: /api/hotels/my_hotel/
        Returns the single hotel instance managed by the requesting authenticated user.
        """
        user = request.user
        
        # Check 1: Ensure user is linked to a hotel as a manager
        try:
            # We assume the Hotel model has a manager=OneToOneField(User)
            hotel = Hotel.objects.get(manager=user)
        except Hotel.DoesNotExist:
            # If the user is authenticated but not linked to a hotel, deny access
            return Response(
                {"detail": "Access Denied: You are not assigned to manage any hotel."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        

        # 2. Get the date from query parameters (e.g., ?date=2023-12-25)
        date_str = request.query_params.get('date')
        if date_str:
            try:
                # Convert string to date object
                filter_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Default: Use today's date for "Upcoming" bookings
            filter_date = timezone.now().date()

        # 3. Serialize the basic hotel data
        serializer = self.get_serializer(hotel)
        data = serializer.data

        # 4. Fetch and Filter Bookings
        # We only want bookings where the guest hasn't checked out yet relative to our filter_date
        bookings = Booking.objects.filter(
            room__hotel=hotel,
            check_out_date__gte=filter_date
        ).order_by('check_in_date')

        # 5. Inject the filtered bookings into the response
        # This replaces the static 'upcoming_bookings' from the SerializerMethodField
        data['upcoming_bookings'] = BookingSerializer(bookings, many=True).data
        
        return Response(data)

class RoomViewSet(viewsets.ModelViewSet):
    
    """
    Handles read-only for public, and CRUD for the hotel manager.
    """
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsHotelManagerOrReadOnly] # <<< APPLY NEW PERMISSION

    def perform_create(self, serializer):
        # When creating a room, we need to ensure the room's hotel is managed by the user.
        # This requires the hotel ID to be passed in the request data.
        hotel_id = self.request.data.get('hotel')
        
        if not hotel_id:
            raise ValidationError({'hotel': ['Hotel ID must be provided.']})

        try:
            hotel = Hotel.objects.get(pk=hotel_id)
        except Hotel.DoesNotExist:
            raise ValidationError({'hotel': ['Invalid hotel ID.']})

        # CRITICAL CHECK: Check if the requesting user is the manager of this specific hotel
        if hotel.manager == self.request.user:
            # If the manager matches, save the room linked to that hotel
            serializer.save(hotel=hotel)
        else:
            # If the user is authenticated but not the manager of this hotel, deny access
            raise PermissionDenied("You do not manage this hotel and cannot add rooms to it.")


# --- AUTHENTICATED/SECURED VIEWS (Booking and Registration) ---

class BookingViewSet(viewsets.ModelViewSet):
    """
    Handles secured CRUD operations for bookings.
    Only allows authenticated users to create and view THEIR OWN bookings.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        """
        Filters the queryset to return bookings only for the currently authenticated user.
        """
        user = self.request.user
        # Only return bookings where the user foreign key matches the request user
        return Booking.objects.filter(user=user).order_by('-booked_at')

    def perform_create(self, serializer):
        """
        Assigns the currently authenticated user to the booking automatically.
        """
        serializer.save(user=self.request.user)


class RegisterView(generics.CreateAPIView):
    """
    Handles new user registration.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny] # Must be publicly accessible

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return a simple success message upon registration
        return Response(
            {"message": "User registered successfully. Please log in."}, 
            status=status.HTTP_201_CREATED
        )