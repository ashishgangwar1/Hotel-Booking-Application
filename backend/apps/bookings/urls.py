from django.urls import path

from .views import (
    CreateBookingView,
    MyBookingsView,
    CancelBookingView
)

urlpatterns = [
    path("", CreateBookingView.as_view()),
    path("my/", MyBookingsView.as_view()),
    path("<int:pk>/cancel/", CancelBookingView.as_view()),
]