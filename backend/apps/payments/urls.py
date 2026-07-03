from django.urls import path
from .views import (
    PaymentSuccessView,
    CreatePayPalOrderView,
    CapturePayPalOrderView,
)


urlpatterns = [

    path(
        "create-order/",
        CreatePayPalOrderView.as_view()
    ),

    path(
        "capture/",
        CapturePayPalOrderView.as_view()
    ),

    path(
        "success/",
        PaymentSuccessView.as_view()
    ),
]