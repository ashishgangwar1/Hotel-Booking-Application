from django.db import models
from django.contrib.auth.models import User
from .utils import generate_booking_reference

class Booking(models.Model):

    booking_reference = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True
    )

    STATUS_CHOICES = [
        ("CONFIRMED", "Confirmed"),
        ("CANCELLED", "Cancelled"),
        ("COMPLETED", "Completed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bookings"
    )

    room = models.ForeignKey(
        "hotels.Room",
        on_delete=models.CASCADE,
        related_name="bookings"
    )

    check_in = models.DateField()
    check_out = models.DateField()

    guests = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="CONFIRMED"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.room}"
    
    def save(self, *args, **kwargs):

        if not self.booking_reference:
            self.booking_reference = (
                generate_booking_reference()
            )

        super().save(*args, **kwargs)