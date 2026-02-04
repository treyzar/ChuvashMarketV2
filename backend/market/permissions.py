from django.contrib.auth import get_user_model
from rest_framework.permissions import BasePermission, SAFE_METHODS

User = get_user_model()


class IsSeller(BasePermission):
    """Разрешает доступ только продавцам."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Roles.SELLER)


class IsAdmin(BasePermission):
    """Разрешает доступ только администраторам."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Roles.ADMIN)


class IsOwnerOrReadOnly(BasePermission):
    """Обновление/удаление только владельцем объекта."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, "seller", None) or getattr(obj, "buyer", None) or getattr(obj, "user", None)
        return bool(request.user and request.user.is_authenticated and owner == request.user)

