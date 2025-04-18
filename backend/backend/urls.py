"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path
from api.views import *

urlpatterns = [
    path("api/generate/", generate_response),
    path("api/responses/", get_responses),
    path("api/create_user/", create_user),
    path("api/get_user/", get_user),
    path("api/login_user/", login_user),
    path("api/love_calculator/", love_calculator),
    path("api/chat_history/", get_chat_history),
    path("api/chat_windows/", get_all_chat_windows),
    path("api/chat_windows/create/", create_chat_window),
    path("api/chat_windows/<int:chat_id>/delete/", delete_chat_window),
    path("api/tinder_replies/", tinder_replies),
    path("api/tinder_description/", tinder_description),  # Add new endpoint
    path("api/update_user/", update_user),
]
