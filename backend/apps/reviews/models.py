from django.db import models
from django.contrib.auth.models import User
from apps.hotels.models import Hotel
from django.db.models import Avg
from django.core.validators import MinValueValidator
from django.core.validators import MaxValueValidator

class Review(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    hotel = models.ForeignKey(
        Hotel,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    rating = models.IntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )

    comment = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            "user",
            "hotel"
        )

    def save(self, *args, **kwargs):

        super().save(*args, **kwargs)

        avg_rating = (
            Review.objects
            .filter(hotel=self.hotel)
            .aggregate(Avg("rating"))
            ["rating__avg"]
        )

        self.hotel.rating = round(avg_rating or 0, 1)
        self.hotel.save(update_fields=["rating"])

    