from .models import Booking


class BookingService:

    @staticmethod
    def room_is_available(
        room,
        check_in,
        check_out
    ):

        overlapping = Booking.objects.filter(
            room=room,
            status="CONFIRMED",
            check_in__lt=check_out,
            check_out__gt=check_in
        )

        return not overlapping.exists()

    @staticmethod
    def create_booking(
        user,
        room,
        check_in,
        check_out,
        guests
    ):

        if not BookingService.room_is_available(
            room,
            check_in,
            check_out
        ):
            raise ValueError(
                "Room is not available"
            )

        return Booking.objects.create(
            user=user,
            room=room,
            check_in=check_in,
            check_out=check_out,
            guests=guests
        )