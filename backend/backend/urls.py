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
    path("api/create_chat_window/", create_chat_window),
    path("api/get_chat_window/", get_chat_windows),
]
