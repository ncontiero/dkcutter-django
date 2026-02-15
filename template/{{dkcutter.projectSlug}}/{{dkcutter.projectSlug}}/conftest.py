import pytest

from {{ dkcutter.projectSlug }}.users.models import User
from {{ dkcutter.projectSlug }}.users.tests.factories import UserFactory


@pytest.fixture(autouse=True)
def _media_storage(settings, tmpdir) -> None:
    settings.MEDIA_ROOT = tmpdir.strpath


@pytest.fixture
def user(db):
    return UserFactory()
