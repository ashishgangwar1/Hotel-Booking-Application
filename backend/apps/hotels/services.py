from .models import Hotel


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
    