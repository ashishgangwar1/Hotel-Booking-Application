from django.contrib.auth.models import User
from .models import Profile


class AccountService:

    @staticmethod
    def register_user(
        username,
        email,
        password
    ):

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        Profile.objects.create(
            user=user
        )

        return user

# later

# AccountService.change_password()

# AccountService.update_profile()

# AccountService.delete_account()