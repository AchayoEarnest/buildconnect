from rest_framework.permissions import BasePermission


class IsEngineer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'engineer'


class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'client'


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'engineer'):
            return obj.engineer.user == request.user
        if hasattr(obj, 'client'):
            return obj.client.user == request.user
        return False
