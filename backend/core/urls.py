from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [

    # Admin
    path(
        "admin/",
        admin.site.urls
    ),

    # Accounts
    path(
        "api/accounts/",
        include("apps.accounts.urls")
    ),

    # Hotels
    path(
        "api/hotels/",
        include("apps.hotels.urls")
    ),

    # Bookings
    path(
        "api/bookings/",
        include("apps.bookings.urls")
    ),

    # JWT Authentication
    path(
        "api/token/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),

    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),

    path(
        "api/reviews/",
        include("apps.reviews.urls")
    ),
    path(
        "api/payments/",
        include("apps.payments.urls")
    ),
]

# Media files during development
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )