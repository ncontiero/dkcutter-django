from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.shortcuts import redirect
from django.shortcuts import render
from django.utils.translation import gettext_lazy as _

from .forms import UpdateUserForm
from .models import User


@login_required
{%- if dkcutter.usernameType == "email" %}
def user_detail(request: HttpRequest, pk: int):
    user = get_object_or_404(User, pk=pk)
    return render(request, "users/user_detail.html", {"user": user})
{%- else %}
def user_detail(request: HttpRequest, username: str):
    user = get_object_or_404(User, username=username)
    return render(request, "users/user_detail.html", {"user": user})
{%- endif %}


@login_required
def user_update(request: HttpRequest):
    user: User = request.user
    if request.method != "POST":
        form = UpdateUserForm(instance=user, initial={"name": user.name})
        return render(request, "users/user_update.html", {"user": user, "form": form})

    form = UpdateUserForm(request.POST, instance=user)
    if form.is_valid():
        form.save()
        messages.success(request, _("Information successfully updated"))
        {%- if dkcutter.usernameType == "email" %}
        return redirect("users:detail", pk=user.pk)
        {%- else %}
        return redirect("users:detail", username=user.username)
        {%- endif %}

    return render(request, "users/user_update.html", {"user": user, "form": form})


@login_required
def user_redirect(request: HttpRequest):
    return redirect(request.user.get_absolute_url())
