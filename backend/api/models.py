from django.db import models


class WingmanUsers(models.Model):
    name = models.TextField(max_length=100)
    email = models.TextField(unique=True)
    sex = models.TextField(max_length=10)
    age = models.IntegerField()
    # Make sure password field is large enough for hashed passwords
    password = models.TextField(max_length=255)  # Increased from 100 to 255
    created_at = models.DateTimeField(auto_now_add=True)
    orientation = models.TextField(max_length=100, default="hetero")

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
    context = models.JSONField(default=list)
    user = models.ForeignKey(WingmanUsers, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"Prompt: {self.prompt[:30]}..."
            if len(self.prompt) > 30
            else f"Prompt: {self.prompt}"
        )

    class Meta:
        ordering = ["-created_at"]


class LlamaChatWindow(models.Model):
    user = models.ForeignKey(WingmanUsers, on_delete=models.CASCADE)
    responses = models.ManyToManyField(LlamaResponse)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"User: {self.user[:30]}..."
            if len(self.user) > 30
            else f"User: {self.user}"
        )

    class Meta:
        ordering = ["-created_at"]


# Add this new model to store Ollama context data
class ChatContext(models.Model):
    chat_window = models.ForeignKey(
        "LlamaChatWindow", related_name="contexts", on_delete=models.CASCADE
    )
    context_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Context for chat {self.chat_window_id} at {self.created_at}"

    # Helper methods to get and set context
    @staticmethod
    def get_latest_context(chat_id):
        try:
            context_obj = (
                ChatContext.objects.filter(chat_window_id=chat_id)
                .order_by("-created_at")
                .first()
            )
            return context_obj.context_data if context_obj else None
        except Exception:
            return None

    @staticmethod
    def store_context(chat_id, context_data):
        if not context_data or not chat_id:
            return None
        try:
            return ChatContext.objects.create(
                chat_window_id=chat_id, context_data=context_data
            )
        except Exception as e:
            print(f"Error storing context: {e}")
            return None
