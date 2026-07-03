from django.urls import path

from .views import (
    AddToWishlistView,
    WishlistView,
    RemoveWishlistItemView
)

urlpatterns = [

    path(
        "",
        AddToWishlistView.as_view()
    ),

    path(
        "list/",
        WishlistView.as_view()
    ),

    path(
        "<int:pk>/",
        RemoveWishlistItemView.as_view()
    ),
]