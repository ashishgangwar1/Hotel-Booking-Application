from django.urls import path
from .views import PaymentSuccessView

urlpatterns = [
    path(
        "success/",
        PaymentSuccessView.as_view()
    ),
]