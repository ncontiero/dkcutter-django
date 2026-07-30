from __future__ import annotations

from factory import Faker
from factory import post_generation
from factory.django import DjangoModelFactory

from {{ dkcutter.projectSlug }}.users.models import User


class UserFactory(DjangoModelFactory[User]):
    {%- if dkcutter.usernameType == "username" %}
    username = Faker("user_name")
    {%- endif %}
    email = Faker("email")
    name = Faker("name")

    @post_generation
    def password(self: User, create: bool, extracted: str | None, **kwargs):  # noqa: FBT001
        password = (
            extracted or Faker(
                "password",
                length=42,
                special_chars=True,
                digits=True,
                upper_case=True,
                lower_case=True,
            ).evaluate(None, None, extra={"locale": None})
        )
        self.set_password(password)
        if create:
            self.save()

    class Meta:
        model = User
        django_get_or_create = ["{{dkcutter.usernameType}}"]
        skip_postgeneration_save = True
