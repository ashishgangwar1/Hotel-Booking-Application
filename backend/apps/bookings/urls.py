from django.urls import path

from .views import (
    CreateBookingView,
    MyBookingDetailView,
    MyBookingsView,
    CancelBookingView,
    ManagerBookingsView,
    ApproveBookingView,
    RejectBookingView,
    CompleteBookingView,
    ManagerDashboardView,
    BookingHistoryView,
    RevenueAnalyticsView,
    OccupancyAnalyticsView,
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
    ),path(
        "manager/dashboard/",
        ManagerDashboardView.as_view()
    ),
    path(
        "my/<int:pk>/",
        MyBookingDetailView.as_view()
    ),
    path(
        "history/",
        BookingHistoryView.as_view()
    ),
    path(
        "manager/revenue/",
        RevenueAnalyticsView.as_view()
    ),
    path(
        "manager/occupancy/",
        OccupancyAnalyticsView.as_view()
    ),
]