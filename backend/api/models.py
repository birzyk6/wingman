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
