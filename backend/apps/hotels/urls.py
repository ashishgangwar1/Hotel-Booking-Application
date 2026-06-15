from django.urls import path

from .views import (
    HotelListView,
    HotelSearchView
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
]