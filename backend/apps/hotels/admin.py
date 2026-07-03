from django.contrib import admin
from .models import (
    Hotel,
    RoomType,
    Room,
    Amenity,
    HotelImage,
    RoomImage
)

admin.site.register(Hotel)
admin.site.register(RoomType)
admin.site.register(Room)
admin.site.register(Amenity)

admin.site.register(HotelImage)
admin.site.register(RoomImage)