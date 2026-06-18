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
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("REJECTED", "Rejected"),
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
    
    price_per_night = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    
    approved_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_bookings"
    )

    approved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    rejected_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="rejected_bookings"
    )

    rejected_at = models.DateTimeField(
        null=True,
        blank=True
    )

    completed_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="completed_bookings"
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.room}"
    
    def save(self, *args, **kwargs):

        if not self.booking_reference:
            self.booking_reference = (
                generate_booking_reference()
            )

        if not self.price_per_night:

            self.price_per_night = (
                self.room.room_type.price_per_night
            )

        nights = (
            self.check_out - self.check_in
        ).days

        self.total_amount = (
            nights * self.price_per_night
        )

        super().save(*args, **kwargs)