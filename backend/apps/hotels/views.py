from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import (
    HotelSerializer
)

from .services import (
    HotelService
)


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

    def get(self, request):

        city = request.GET.get(
            "city"
        )

        hotels = HotelService.search_hotels(
            city
        )

        serializer = HotelSerializer(
            hotels,
            many=True
        )

        return Response(
            serializer.data
        )