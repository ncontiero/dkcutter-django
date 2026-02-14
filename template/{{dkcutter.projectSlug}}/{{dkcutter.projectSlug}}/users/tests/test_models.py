from {{ dkcutter.projectSlug }}.users.models import User


def test_user_get_absolute_url(user: User):
    {%- if dkcutter.usernameType == "email" %}
    assert user.get_absolute_url() == f"/users/{user.pk}/"
    {%- else %}
    assert user.get_absolute_url() == f"/users/{user.username}/"
    {%- endif %}
