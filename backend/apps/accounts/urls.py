from django.urls import path

from .views import (
    RegisterView,
    MeView,
    WishlistView,
    WishlistDeleteView,
    FavoriteView,
    FavoriteDeleteView,
)

urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "me/",
        MeView.as_view(),
        name="me"
    ),

    # Wishlist
    path(
        "wishlist/",
        WishlistView.as_view(),
        name="wishlist"
    ),

    path(
        "wishlist/<int:hotel_id>/",
        WishlistDeleteView.as_view(),
        name="wishlist-delete"
    ),

    # Favorites
    path(
        "favorites/",
        FavoriteView.as_view(),
        name="favorites"
    ),

    path(
        "favorites/<int:hotel_id>/",
        FavoriteDeleteView.as_view(),
        name="favorites-delete"
    ),
]