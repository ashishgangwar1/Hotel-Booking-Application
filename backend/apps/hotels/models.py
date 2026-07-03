from django.db import models
from django.contrib.auth.models import User

class Amenity(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True
    )

    def __str__(self):
        return self.name


class Hotel(models.Model):
    
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owned_hotels",
        null=True,
        blank=True
    )

    name = models.CharField(max_length=255)

    description = models.TextField()

    city = models.CharField(max_length=100)

    address = models.TextField()

    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0
    )

    amenities = models.ManyToManyField(
        Amenity,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name

class HotelImage(models.Model):

    hotel = models.ForeignKey(
        Hotel,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="hotel_images/"
    )

    is_primary = models.BooleanField(
        default=False
    )

    def __str__(self):
        return f"{self.hotel.name} Image"
    

class RoomType(models.Model):
    hotel = models.ForeignKey(
        Hotel,
        on_delete=models.CASCADE,
        related_name="room_types"
    )

    name = models.CharField(
        max_length=100
    )

    capacity = models.PositiveIntegerField()

    price_per_night = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.hotel.name} - {self.name}"


class Room(models.Model):
    hotel = models.ForeignKey(
        Hotel,
        on_delete=models.CASCADE,
        related_name="rooms"
    )

    room_type = models.ForeignKey(
        RoomType,
        on_delete=models.CASCADE,
        related_name="rooms"
    )

    room_number = models.CharField(
        max_length=20
    )



    def __str__(self):
        return f"{self.hotel.name} - {self.room_number}"

class RoomImage(models.Model):

    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="room_images/"
    )

    def __str__(self):
        return f"{self.room.room_number} Image"
    


   