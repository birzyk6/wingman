from django.db import models


class LlamaResponse(models.Model):
    prompt = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"Prompt: {self.prompt[:30]}..."
            if len(self.prompt) > 30
            else f"Prompt: {self.prompt}"
        )

    class Meta:
        ordering = ["-created_at"]

class WingmanUsers(models.Model):
    name = models.TextField(max_length=100)
    email = models.TextField(unique=True)
    sex = models.TextField(max_length=10)
    age = models.IntegerField(max_length=3)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"Name: {self.name[:30]}..."
            if len(self.name) > 30
            else f"Name: {self.name}"
        )

    class Meta:
        ordering = ["-created_at"]
