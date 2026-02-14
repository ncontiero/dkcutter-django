from django.urls import path

from .views import user_detail
from .views import user_redirect
from .views import user_update

app_name = "users"
urlpatterns = [
    path("~redirect/", view=user_redirect, name="redirect"),
    path("~update/", view=user_update, name="update"),
    {%- if dkcutter.usernameType == "email" %}
    path("<int:pk>/", view=user_detail, name="detail"),
    {%- else %}
    path("<str:username>/", view=user_detail, name="detail"),
    {%- endif %}
]
