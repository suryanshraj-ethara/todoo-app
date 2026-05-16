from rest_framework import viewsets, permissions, filters
from .models import Project
from .serializers import ProjectSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'ADMIN'

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['deadline', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Project.objects.all()
        return Project.objects.filter(members=user).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
