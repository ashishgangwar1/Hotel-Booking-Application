from django.urls import path

from .views import (
    HotelListView,
    HotelSearchView,
    RoomListView,
    HotelRoomsView,
    MyHotelsView,
    CreateHotelView,
    UpdateHotelView,
    CreateRoomTypeView,
    UpdateRoomTypeView,
    DeleteRoomTypeView,
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
    path(
        "room-types/create/",
        CreateRoomTypeView.as_view(),
        name="room-type-create"
    ),

    path(
        "room-types/<int:pk>/update/",
        UpdateRoomTypeView.as_view(),
        name="room-type-update"
    ),

    path(
        "room-types/<int:pk>/delete/",
        DeleteRoomTypeView.as_view(),
        name="room-type-delete"
    ),
]
