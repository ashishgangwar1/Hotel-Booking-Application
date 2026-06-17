from django.urls import path

from .views import (
    HotelListView,
    HotelSearchView,
    RoomListView,
    HotelRoomsView,
    MyHotelsView,
    CreateHotelView,
    UpdateHotelView,
)

urlpatterns = [

    path(
        "",
        HotelListView.as_view(),
        name="hotel-list"
    ),

    path(
        "search/",
        HotelSearchView.as_view(),
        name="hotel-search"
    ),

    path(
        "rooms/",
        RoomListView.as_view(),
        name="room-list"
    ),
    path(
        "<int:hotel_id>/rooms/",
        HotelRoomsView.as_view(),
        name="hotel-rooms"
    ),
    path(
        "my-hotels/",
        MyHotelsView.as_view(),
        name="my-hotels"
    ),
    path(
        "create/",
        CreateHotelView.as_view(),
        name="hotel-create"
    ),
    path(
        "<int:pk>/update/",
        UpdateHotelView.as_view(),
        name="hotel-update"
    ),
]
