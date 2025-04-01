#### python

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from api.models import WingmanUsers


class Command(BaseCommand):
    help = "Seeds a test user."

    def handle(self, *args, **options):
        # Create or update a test user
        user_data = {
            "name": "test",
            "email": "test@example.com",
            "sex": "male",
            "age": 30,
            "password": make_password("test123"),
        }
        WingmanUsers.objects.update_or_create(
            email=user_data["email"],
            defaults=user_data,
        )
        self.stdout.write(self.style.SUCCESS("Test user created."))
