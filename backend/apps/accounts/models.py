# from django.db import models
# from django.contrib.auth.models import User

# class Profile(models.Model):

#     ROLE_CHOICES = [
#         ("CUSTOMER", "Customer"),
#         ("HOTEL_OWNER", "Hotel Owner"),
#     ]

#     user = models.OneToOneField(
#         User,
#         on_delete=models.CASCADE,
#         related_name="profile"
#     )

#     role = models.CharField(
#         max_length=20,
#         choices=ROLE_CHOICES,
#         default="CUSTOMER"
#     )

#     phone = models.CharField(
#         max_length=15,
#         blank=True
#     )

#     address = models.TextField(
#         blank=True
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

from django.db import models
from django.contrib.auth.models import User


class UserRole(models.TextChoices):
    CUSTOMER = "CUSTOMER", "Customer"
    MANAGER = "MANAGER", "Manager"
    ADMIN = "ADMIN", "Admin"


class Profile(models.Model):



    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER
    )

    phone = models.CharField(
        max_length=15,
        blank=True
    )

    address = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )