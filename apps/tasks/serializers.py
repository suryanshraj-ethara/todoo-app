from rest_framework import serializers
from .models import Task
from apps.users.serializers import UserSerializer

class SimpleProjectSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    project_details = SimpleProjectSerializer(source='project', read_only=True)
    
    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'priority', 'status', 'due_date', 'project', 'project_details', 'assigned_to', 'assigned_to_details', 'created_at', 'updated_at')
