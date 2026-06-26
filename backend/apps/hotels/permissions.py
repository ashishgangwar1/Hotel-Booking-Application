from rest_framework.permissions import BasePermission
from apps.accounts.models import UserRole

class IsManagerOrAdmin(BasePermission):

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ Safely check if profile exists
        try:
            return request.user.profile.role in [
                UserRole.MANAGER,
                UserRole.ADMIN
            ]
        except Exception:
            return False  # ✅ No profile = not a manager, return False not 500