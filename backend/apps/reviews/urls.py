from apps.reviews.views import CreateReviewView
from apps.reviews.views import HotelReviewListView
from django.urls import path

urlpatterns = [
    path(
        "create/",
        CreateReviewView.as_view(),
        name="review-create"
    ),
    path(
        "hotel/<int:hotel_id>/",
        HotelReviewListView.as_view(),
        name="hotel-reviews"
    ),
]