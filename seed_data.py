import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.projects.models import Project
from apps.tasks.models import Task
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

def seed():
    # Clear existing data
    Task.objects.all().delete()
    Project.objects.all().delete()
    User.objects.all().delete()

    print("Creating users...")

    # --- Admin: Suryansh (superuser with all permissions) ---
    suryansh = User.objects.create_superuser(
        'suryansh', 'suryansh@todoo.com', 'suryansh123',
        first_name='Suryansh', last_name='Raj', role='ADMIN'
    )

    # --- 15 Unique Members (no member appears in more than one project) ---

    # Team Alpha members (Talos)
    ankit = User.objects.create_user('ankit', 'ankit@todoo.com', 'ankit123', first_name='Ankit', last_name='Sharma', role='MEMBER')
    satyendra = User.objects.create_user('satyendra', 'satyendra@todoo.com', 'satyendra123', first_name='Satyendra', last_name='Kumar', role='MEMBER')
    saumya = User.objects.create_user('saumya', 'saumya@todoo.com', 'saumya123', first_name='Saumya', last_name='Singh', role='MEMBER')
    manu = User.objects.create_user('manu', 'manu@todoo.com', 'manu123', first_name='Manu', last_name='Verma', role='MEMBER')

    # Team Beta members (Valor)
    sumit = User.objects.create_user('sumit', 'sumit@todoo.com', 'sumit123', first_name='Sumit', last_name='Gupta', role='MEMBER')
    priya = User.objects.create_user('priya', 'priya@todoo.com', 'priya123', first_name='Priya', last_name='Patel', role='MEMBER')
    sneha = User.objects.create_user('sneha', 'sneha@todoo.com', 'sneha123', first_name='Sneha', last_name='Mishra', role='MEMBER')
    rahul = User.objects.create_user('rahul', 'rahul@todoo.com', 'rahul123', first_name='Rahul', last_name='Tiwari', role='MEMBER')

    # Team Gamma members (Atlas)
    dhananjay = User.objects.create_user('dhananjay', 'dhananjay@todoo.com', 'dhananjay123', first_name='Dhananjay', last_name='Rao', role='MEMBER')
    vaibhav = User.objects.create_user('vaibhav', 'vaibhav@todoo.com', 'vaibhav123', first_name='Vaibhav', last_name='Joshi', role='MEMBER')
    shreya = User.objects.create_user('shreya', 'shreya@todoo.com', 'shreya123', first_name='Shreya', last_name='Das', role='MEMBER')
    gaurav = User.objects.create_user('gaurav', 'gaurav@todoo.com', 'gaurav123', first_name='Gaurav', last_name='Pandey', role='MEMBER')

    # Team Delta members (Vindex)
    yash = User.objects.create_user('yash', 'yash@todoo.com', 'yash123', first_name='Yash', last_name='Agarwal', role='MEMBER')
    madhwan = User.objects.create_user('madhwan', 'madhwan@todoo.com', 'madhwan123', first_name='Madhwan', last_name='Dubey', role='MEMBER')
    mayank = User.objects.create_user('mayank', 'mayank@todoo.com', 'mayank123', first_name='Mayank', last_name='Chauhan', role='MEMBER')

    print("Creating projects with unique teams...")

    # --- Team Alpha → Talos (4 members) ---
    talos = Project.objects.create(
        title='Talos', description='AI-powered analytics platform for real-time data processing and insights generation.',
        status='ACTIVE', deadline=timezone.now().date() + timedelta(days=45), created_by=suryansh
    )
    talos.members.add(ankit, satyendra, saumya, manu)

    # --- Team Beta → Valor (4 members) ---
    valor = Project.objects.create(
        title='Valor', description='Next-gen mobile banking application with biometric authentication and smart budgeting.',
        status='ACTIVE', deadline=timezone.now().date() + timedelta(days=60), created_by=suryansh
    )
    valor.members.add(sumit, priya, sneha, rahul)

    # --- Team Gamma → Atlas (4 members) ---
    atlas = Project.objects.create(
        title='Atlas', description='Cloud infrastructure management dashboard for multi-cloud deployments.',
        status='ACTIVE', deadline=timezone.now().date() + timedelta(days=30), created_by=suryansh
    )
    atlas.members.add(dhananjay, vaibhav, shreya, gaurav)

    # --- Team Delta → Vindex (3 members) ---
    vindex = Project.objects.create(
        title='Vindex', description='Enterprise search engine with NLP-powered semantic search and document indexing.',
        status='ON_HOLD', deadline=timezone.now().date() + timedelta(days=90), created_by=suryansh
    )
    vindex.members.add(yash, madhwan, mayank)

    print("Creating tasks...")

    # --- Tasks for Talos (Team Alpha) ---
    Task.objects.create(title='Design data pipeline architecture', description='Create ETL pipeline diagrams', priority='HIGH', status='COMPLETED', due_date=timezone.now().date() - timedelta(days=3), project=talos, assigned_to=ankit)
    Task.objects.create(title='Implement Kafka consumers', description='Set up message queue consumers for streaming data', priority='HIGH', status='IN_PROGRESS', due_date=timezone.now().date() + timedelta(days=5), project=talos, assigned_to=satyendra)
    Task.objects.create(title='Build analytics dashboard UI', description='React components for chart visualizations', priority='MEDIUM', status='IN_PROGRESS', due_date=timezone.now().date() + timedelta(days=7), project=talos, assigned_to=saumya)
    Task.objects.create(title='Write unit tests for API layer', description='Pytest coverage for all endpoints', priority='MEDIUM', status='TODO', due_date=timezone.now().date() + timedelta(days=10), project=talos, assigned_to=manu)
    Task.objects.create(title='Optimize database queries', description='Add indexes and optimize slow queries', priority='LOW', status='TODO', due_date=timezone.now().date() + timedelta(days=14), project=talos, assigned_to=ankit)

    # --- Tasks for Valor (Team Beta) ---
    Task.objects.create(title='Implement biometric auth module', description='Fingerprint and face ID integration', priority='HIGH', status='IN_PROGRESS', due_date=timezone.now().date() + timedelta(days=4), project=valor, assigned_to=sumit)
    Task.objects.create(title='Design transaction history page', description='Figma mockups for transaction list', priority='MEDIUM', status='COMPLETED', due_date=timezone.now().date() - timedelta(days=5), project=valor, assigned_to=priya)
    Task.objects.create(title='Build budget tracking feature', description='Monthly spending analytics with charts', priority='HIGH', status='TODO', due_date=timezone.now().date() + timedelta(days=8), project=valor, assigned_to=sneha)
    Task.objects.create(title='API security audit', description='Review and fix API vulnerabilities', priority='HIGH', status='TODO', due_date=timezone.now().date() - timedelta(days=1), project=valor, assigned_to=rahul)

    # --- Tasks for Atlas (Team Gamma) ---
    Task.objects.create(title='Setup Terraform modules', description='IaC templates for AWS/GCP/Azure', priority='HIGH', status='COMPLETED', due_date=timezone.now().date() - timedelta(days=7), project=atlas, assigned_to=dhananjay)
    Task.objects.create(title='Build deployment wizard UI', description='Step-by-step cloud deployment interface', priority='MEDIUM', status='IN_PROGRESS', due_date=timezone.now().date() + timedelta(days=6), project=atlas, assigned_to=vaibhav)
    Task.objects.create(title='Implement monitoring alerts', description='Configure alerts for CPU, memory, disk usage', priority='HIGH', status='TODO', due_date=timezone.now().date() + timedelta(days=3), project=atlas, assigned_to=shreya)
    Task.objects.create(title='Write documentation', description='User guides and API docs', priority='LOW', status='TODO', due_date=timezone.now().date() + timedelta(days=15), project=atlas, assigned_to=gaurav)

    # --- Tasks for Vindex (Team Delta) ---
    Task.objects.create(title='Research NLP models', description='Evaluate BERT vs GPT for semantic search', priority='HIGH', status='IN_PROGRESS', due_date=timezone.now().date() + timedelta(days=12), project=vindex, assigned_to=yash)
    Task.objects.create(title='Design search result ranking algorithm', description='Relevance scoring system', priority='MEDIUM', status='TODO', due_date=timezone.now().date() + timedelta(days=20), project=vindex, assigned_to=madhwan)
    Task.objects.create(title='Build document indexing service', description='Elasticsearch integration', priority='HIGH', status='TODO', due_date=timezone.now().date() + timedelta(days=25), project=vindex, assigned_to=mayank)

    print("=" * 55)
    print("SEED DATA CREATED SUCCESSFULLY!")
    print("=" * 55)
    print()
    print("CREDENTIALS:")
    print("-" * 55)
    print(f"{'Username':<15} {'Name':<20} {'Password':<15} {'Role'}")
    print("-" * 55)
    print(f"{'suryansh':<15} {'Suryansh Raj':<20} {'suryansh123':<15} ADMIN")
    print(f"{'ankit':<15} {'Ankit Sharma':<20} {'ankit123':<15} MEMBER")
    print(f"{'satyendra':<15} {'Satyendra Kumar':<20} {'satyendra123':<15} MEMBER")
    print(f"{'saumya':<15} {'Saumya Singh':<20} {'saumya123':<15} MEMBER")
    print(f"{'manu':<15} {'Manu Verma':<20} {'manu123':<15} MEMBER")
    print(f"{'sumit':<15} {'Sumit Gupta':<20} {'sumit123':<15} MEMBER")
    print(f"{'priya':<15} {'Priya Patel':<20} {'priya123':<15} MEMBER")
    print(f"{'sneha':<15} {'Sneha Mishra':<20} {'sneha123':<15} MEMBER")
    print(f"{'rahul':<15} {'Rahul Tiwari':<20} {'rahul123':<15} MEMBER")
    print(f"{'dhananjay':<15} {'Dhananjay Rao':<20} {'dhananjay123':<15} MEMBER")
    print(f"{'vaibhav':<15} {'Vaibhav Joshi':<20} {'vaibhav123':<15} MEMBER")
    print(f"{'shreya':<15} {'Shreya Das':<20} {'shreya123':<15} MEMBER")
    print(f"{'gaurav':<15} {'Gaurav Pandey':<20} {'gaurav123':<15} MEMBER")
    print(f"{'yash':<15} {'Yash Agarwal':<20} {'yash123':<15} MEMBER")
    print(f"{'madhwan':<15} {'Madhwan Dubey':<20} {'madhwan123':<15} MEMBER")
    print(f"{'mayank':<15} {'Mayank Chauhan':<20} {'mayank123':<15} MEMBER")
    print("-" * 55)
    print()
    print("TEAMS (each member is unique to ONE project only):")
    print("  Team Alpha (Talos):  Ankit, Satyendra, Saumya, Manu")
    print("  Team Beta  (Valor):  Sumit, Priya, Sneha, Rahul")
    print("  Team Gamma (Atlas):  Dhananjay, Vaibhav, Shreya, Gaurav")
    print("  Team Delta (Vindex): Yash, Madhwan, Mayank")

if __name__ == '__main__':
    seed()
