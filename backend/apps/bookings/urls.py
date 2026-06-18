from django.urls import path

from .views import (
    CreateBookingView,
    MyBookingsView,
    CancelBookingView,
    ManagerBookingsView,
    ApproveBookingView,
    RejectBookingView,
    CompleteBookingView,
)

urlpatterns = [
    path("", CreateBookingView.as_view()),
    path("my/", MyBookingsView.as_view()),
    path("<int:pk>/cancel/", CancelBookingView.as_view()),
    path(
    "manager/",
        ManagerBookingsView.as_view()
    ),
    path(
        "manager/<int:pk>/approve/",
        ApproveBookingView.as_view()
    ),

    path(
        "manager/<int:pk>/reject/",
        RejectBookingView.as_view()
    ),
    path(
        "manager/<int:pk>/complete/",
        CompleteBookingView.as_view()
    ),
]