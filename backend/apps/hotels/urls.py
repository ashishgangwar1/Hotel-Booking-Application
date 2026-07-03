
from django.urls import path

from .views import (
    HotelListView,
    HotelDetailView,
    HotelSearchView,
    RoomListView,
    HotelRoomsView,
    MyHotelsView,
    CreateHotelView,
    UpdateHotelView,
    DeleteHotelView,
    CreateRoomTypeView,
    UpdateRoomTypeView,
    DeleteRoomTypeView,
    RoomDetailView,
    ManagerRoomListView,
    CreateRoomView,
    UpdateRoomView,
    DeleteRoomView,
    RevenueAnalyticsView,      
    OccupancyAnalyticsView,
    RoomTypeListView,    
)

urlpatterns = [
    path("", HotelListView.as_view(), name="hotel-list"),
    path("<int:pk>/", HotelDetailView.as_view(), name="hotel-detail"),
    path("search/", HotelSearchView.as_view(), name="hotel-search"),
    path("rooms/", RoomListView.as_view(), name="room-list"),
    path("rooms/<int:pk>/", RoomDetailView.as_view(), name="room-detail"),
    path("<int:hotel_id>/rooms/", HotelRoomsView.as_view(), name="hotel-rooms"),
    path("my-hotels/", MyHotelsView.as_view(), name="my-hotels"),
    path("create/", CreateHotelView.as_view(), name="hotel-create"),
    path("<int:pk>/update/", UpdateHotelView.as_view(), name="hotel-update"),
    path("<int:pk>/delete/", DeleteHotelView.as_view(), name="hotel-delete"),
    path("room-types/create/", CreateRoomTypeView.as_view(), name="room-type-create"),
    path("room-types/<int:pk>/update/", UpdateRoomTypeView.as_view(), name="room-type-update"),
    path("room-types/<int:pk>/delete/", DeleteRoomTypeView.as_view(), name="room-type-delete"),
    path("manager/rooms/", ManagerRoomListView.as_view()),
    path("manager/rooms/create/", CreateRoomView.as_view()),
    path("manager/rooms/<int:pk>/update/", UpdateRoomView.as_view()),
    path("manager/rooms/<int:pk>/delete/", DeleteRoomView.as_view()),

    
    path("analytics/revenue/", RevenueAnalyticsView.as_view(), name="revenue-analytics"),
    path("analytics/occupancy/", OccupancyAnalyticsView.as_view(), name="occupancy-analytics"),
    path("room-types/", RoomTypeListView.as_view(), name="room-type-list"),
]