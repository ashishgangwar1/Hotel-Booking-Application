from .models import Hotel, Room
from apps.bookings.availability_service import AvailabilityService
from datetime import datetime


class HotelService:

    @staticmethod
    def get_all_hotels():

        return Hotel.objects.prefetch_related(
            "room_types",
            "room_types__rooms"
        )

    @staticmethod
    def search_hotels(city):

        return Hotel.objects.filter(
            city__icontains=city
        )
    
    @staticmethod
    def get_user_hotels(user):

        return Hotel.objects.filter(
            owner=user
        )
    
    @staticmethod
    def search_hotels(filters):

        hotels = Hotel.objects.prefetch_related(
            "room_types",
            "room_types__rooms",
            "amenities"
        )

        city = filters.get("city")
        rating = filters.get("rating")
        amenity = filters.get("amenity")
        min_price = filters.get("min_price")
        max_price = filters.get("max_price")
        room_type = filters.get("room_type")
        guests = filters.get("guests")

        if city:
            hotels = hotels.filter(
                city__icontains=city
            )

        if rating:
            hotels = hotels.filter(
                rating__gte=rating
            )

        if amenity:
            hotels = hotels.filter(
                amenities__name__iexact=amenity
            )

        if min_price:
            hotels = hotels.filter(
                room_types__price_per_night__gte=min_price
            )

        if max_price:
            hotels = hotels.filter(
                room_types__price_per_night__lte=max_price
            )

        if room_type:
            hotels = hotels.filter(
                room_types__name__icontains=room_type
            )

        if guests:
            hotels = hotels.filter(
                room_types__capacity__gte=guests
            )

        hotels = hotels.distinct()

        check_in = filters.get("check_in")
        check_out = filters.get("check_out")

        if check_in and check_out:

            check_in = datetime.strptime(
                check_in,
                "%Y-%m-%d"
            ).date()

            check_out = datetime.strptime(
                check_out,
                "%Y-%m-%d"
            ).date()

            available_hotel_ids = []

            for hotel in hotels:

                rooms = Room.objects.filter(
                    hotel=hotel
                )

                available = any(
                    AvailabilityService.is_room_available(
                        room,
                        check_in,
                        check_out
                    )
                    for room in rooms
                )

                if available:
                    available_hotel_ids.append(
                        hotel.id
                    )

            hotels = hotels.filter(
                id__in=available_hotel_ids
            )

        return hotels
        