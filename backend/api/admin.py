from django.contrib import admin
from .models import LlamaResponse, WingmanUsers, LlamaChatting


@admin.register(WingmanUsers)
class WingmanUsersAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "sex", "age", "created_at")
    search_fields = ("name", "email")
    list_filter = ("created_at", "sex")
    readonly_fields = ("created_at",)


@admin.register(LlamaResponse)
class LlamaResponseAdmin(admin.ModelAdmin):
    list_display = ("id", "prompt_short", "response_short", "created_at")
    search_fields = ("prompt", "response")
    list_filter = ("created_at",)
    readonly_fields = ("created_at",)

    def prompt_short(self, obj):
        return obj.prompt[:50] + "..." if len(obj.prompt) > 50 else obj.prompt

    def response_short(self, obj):
        return obj.response[:50] + "..." if len(obj.response) > 50 else obj.response

    prompt_short.short_description = "Prompt"
    response_short.short_description = "Response"


@admin.register(LlamaChatting)
class LlamaChattingAdmin(admin.ModelAdmin):
    list_display = ("id", "description_short", "created_at")
    search_fields = ("description", "prompt")
    list_filter = ("created_at",)
    readonly_fields = ("created_at",)

    def description_short(self, obj):
        return (
            obj.description[:50] + "..."
            if len(obj.description) > 50
            else obj.description
        )

    description_short.short_description = "Description"
