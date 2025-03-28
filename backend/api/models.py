from django.db import models


class WingmanUsers(models.Model):
    name = models.TextField(max_length=100)
    email = models.TextField(unique=True)
    sex = models.TextField(max_length=10)
    age = models.IntegerField()
    password = models.TextField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"Name: {self.name[:30]}..."
            if len(self.name) > 30
            else f"Name: {self.name}"
        )

    class Meta:
        ordering = ["-created_at"]

class LlamaResponse(models.Model):
    prompt = models.TextField()
    response = models.TextField()
    context=models.JSONField(default=list)
    user= models.ForeignKey(WingmanUsers, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"Prompt: {self.prompt[:30]}..."
            if len(self.prompt) > 30
            else f"Prompt: {self.prompt}"
        )

    class Meta:
        ordering = ["-created_at"]

class LlamaChatting(models.Model):
    user= models.ForeignKey(WingmanUsers, on_delete=models.CASCADE)
    prompt = models.TextField()
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return (
            f"Description: {self.description[:30]}..."
            if len(self.description) > 30
            else f"Description: {self.description}"
        )

    class Meta:
        ordering = ["-created_at"]