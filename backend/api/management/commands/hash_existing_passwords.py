from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from api.models import WingmanUsers


class Command(BaseCommand):
    help = "Hash existing plaintext passwords in the database"

    def handle(self, *args, **options):
        users = WingmanUsers.objects.all()
        count = 0

        self.stdout.write(self.style.SUCCESS("Starting to hash existing passwords..."))

        for user in users:
            # Check if the password doesn't look like a hash already
            # Django hashed passwords start with algorithm identifiers like 'pbkdf2_sha256$'
            if not user.password.startswith(("pbkdf2_sha256$", "bcrypt$", "argon2")):
                plaintext_password = user.password
                user.password = make_password(plaintext_password)
                user.save()
                count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Successfully hashed passwords for {count} users")
        )
