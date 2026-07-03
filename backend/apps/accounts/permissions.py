from rest_framework.permissions import BasePermission
from .models import UserRole

class IsCustomer(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):
        return (
            request.user.is_authenticated
            and
            request.user.profile.role
            == UserRole.CUSTOMER
        )

class IsManager(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):
        return (
            request.user.is_authenticated
            and
            request.user.profile.role
            == UserRole.MANAGER
        )
    
class IsAdmin(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):
        return (
            request.user.is_authenticated
            and
            request.user.profile.role
            == UserRole.ADMIN
        )
    
class IsManagerOrAdmin(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):
        return (
            request.user.is_authenticated
            and
            request.user.profile.role in [
                UserRole.MANAGER,
                UserRole.ADMIN
            ]
        )