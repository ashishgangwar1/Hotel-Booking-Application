from apps.bookings.models import Booking


class AvailabilityService:

    @staticmethod
    def is_room_available(
        room,
        check_in,
        check_out
    ):
        overlapping = Booking.objects.filter(
            room=room,
            status="CONFIRMED",
            check_in__lt=check_out,
            check_out__gt=check_in
        ).exists()

        return not overlapping