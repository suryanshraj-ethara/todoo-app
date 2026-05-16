from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.projects.models import Project
from apps.tasks.models import Task
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Q, F
from datetime import timedelta
import collections

User = get_user_model()

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        
        if user.role == 'ADMIN':
            projects = Project.objects.all()
            tasks = Task.objects.all()
            members = User.objects.filter(role='MEMBER')
        else:
            projects = Project.objects.filter(members=user)
            tasks = Task.objects.filter(assigned_to=user)
            members = User.objects.none()

        total_projects = projects.count()
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='COMPLETED').count()
        in_progress_tasks = tasks.filter(status='IN_PROGRESS').count()
        todo_tasks = tasks.filter(status='TODO').count()
        overdue_tasks = tasks.filter(due_date__lt=today).exclude(status='COMPLETED').count()

        # Efficiency percentage
        efficiency = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0

        recent_tasks = tasks.order_by('-updated_at')[:5].values('id', 'title', 'status', 'updated_at')

        # ──────────────────────────────────────
        # FEATURE 1: Smart Deadline Predictor
        # ──────────────────────────────────────
        project_risks = []
        for project in projects.prefetch_related('tasks'):
            p_tasks = project.tasks.all()
            p_total = p_tasks.count()
            p_completed = p_tasks.filter(status='COMPLETED').count()
            p_pending = p_tasks.filter(status__in=['TODO', 'IN_PROGRESS']).count()
            p_overdue = p_tasks.filter(due_date__lt=today).exclude(status='COMPLETED').count()

            # Risk scoring formula
            risk_score = (p_pending * 2) + (p_overdue * 5) - p_completed

            if risk_score >= 8:
                risk_level = 'HIGH'
                risk_label = 'High Risk — May miss deadline'
            elif risk_score >= 3:
                risk_level = 'MEDIUM'
                risk_label = 'Medium Risk — Monitor closely'
            else:
                risk_level = 'LOW'
                risk_label = 'Low Risk — On track'

            # Days remaining
            days_remaining = (project.deadline - today).days if project.deadline else None

            project_risks.append({
                'id': project.id,
                'title': project.title,
                'status': project.status,
                'deadline': str(project.deadline) if project.deadline else None,
                'days_remaining': days_remaining,
                'total_tasks': p_total,
                'completed_tasks': p_completed,
                'pending_tasks': p_pending,
                'overdue_tasks': p_overdue,
                'risk_score': risk_score,
                'risk_level': risk_level,
                'risk_label': risk_label,
                'progress': round((p_completed / p_total * 100), 1) if p_total > 0 else 0,
            })

        # ──────────────────────────────────────
        # FEATURE 2: Workload Balancer
        # ──────────────────────────────────────
        workload = []
        if user.role == 'ADMIN':
            members_with_tasks = User.objects.filter(role='MEMBER').annotate(
                active_tasks=Count('assigned_tasks', filter=Q(assigned_tasks__status__in=['TODO', 'IN_PROGRESS'])),
                completed_count=Count('assigned_tasks', filter=Q(assigned_tasks__status='COMPLETED')),
                overdue_count=Count('assigned_tasks', filter=Q(assigned_tasks__due_date__lt=today) & ~Q(assigned_tasks__status='COMPLETED')),
                total_assigned=Count('assigned_tasks')
            ).order_by('active_tasks')

            for m in members_with_tasks:
                workload.append({
                    'id': m.id,
                    'username': m.username,
                    'first_name': m.first_name,
                    'last_name': m.last_name,
                    'active_tasks': m.active_tasks,
                    'completed_count': m.completed_count,
                    'overdue_count': m.overdue_count,
                    'total_assigned': m.total_assigned,
                })

            # Suggestion: member with lowest active tasks
            if workload:
                suggestion = workload[0]  # Already sorted by active_tasks ascending
            else:
                suggestion = None
        else:
            suggestion = None

        # ──────────────────────────────────────
        # FEATURE 3: Productivity Analytics
        # ──────────────────────────────────────
        # Weekly breakdown (last 7 days)
        weekly_data = []
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_completed = tasks.filter(
                status='COMPLETED',
                updated_at__date=day
            ).count()
            day_created = tasks.filter(
                created_at__date=day
            ).count()
            weekly_data.append({
                'day': day_names[day.weekday()],
                'date': str(day),
                'completed': day_completed,
                'created': day_created,
            })

        # Best working day (most completions)
        best_day = max(weekly_data, key=lambda x: x['completed']) if weekly_data else None

        # Task status breakdown for pie/donut
        status_breakdown = {
            'completed': completed_tasks,
            'in_progress': in_progress_tasks,
            'todo': todo_tasks,
            'overdue': overdue_tasks,
        }

        return Response({
            # Basic stats
            'total_projects': total_projects,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'todo_tasks': todo_tasks,
            'overdue_tasks': overdue_tasks,
            'efficiency': efficiency,
            'recent_activity': list(recent_tasks),
            # Feature 1: Deadline Predictor
            'project_risks': project_risks,
            # Feature 2: Workload Balancer
            'workload': workload,
            'workload_suggestion': {
                'name': f"{suggestion['first_name']} {suggestion['last_name']}",
                'username': suggestion['username'],
                'active_tasks': suggestion['active_tasks'],
            } if suggestion else None,
            # Feature 3: Productivity Analytics
            'weekly_data': weekly_data,
            'best_day': best_day,
            'status_breakdown': status_breakdown,
        })
