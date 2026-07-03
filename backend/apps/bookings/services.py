from django.db import transaction

from .models import Booking
from .availability_service import AvailabilityService
from hotels.models import Room
from payments.services import create_payment

class BookingService:

    @staticmethod
    @transaction.atomic
    def create_booking(
        user,
        room,
        check_in,
        check_out,
        guests
    ):

        room = Room.objects.select_for_update().get(
            id=room.id
        )

        if check_in >= check_out:
            raise ValueError(
                "Check-out must be after check-in."
            )

        if not AvailabilityService.is_room_available(
            room,
            check_in,
            check_out
        ):
            raise ValueError(
                "Room already booked for selected dates."
            )

        # return Booking.objects.create(
        #     user=user,
        #     room=room,
        #     check_in=check_in,
        #     check_out=check_out,
        #     guests=guests
        # )
        booking = Booking.objects.create(
            user=user,
            room=room,
            check_in=check_in,
            check_out=check_out,
            guests=guests
        )

        create_payment(booking)

        return booking