from http import HTTPStatus

import pytest
from django.urls import reverse


def test_swagger_accessible_by_admin(admin_client):
    {%- if dkcutter.restFramework == 'DRF' %}
    url = reverse("api-docs")
    {%- elif dkcutter.restFramework == 'DNRF' %}
    url = reverse("api-1.0.0:openapi-view")
    {%- endif %}
    response = admin_client.get(url)
    assert response.status_code == HTTPStatus.OK


@pytest.mark.django_db
def test_swagger_ui_not_accessible_by_normal_user(client):
    {%- if dkcutter.restFramework == 'DRF' %}
    url = reverse("api-docs")
    expected_status_code = 403
    {%- elif dkcutter.restFramework == 'DNRF' %}
    url = reverse("api-1.0.0:openapi-view")
    expected_status_code = HTTPStatus.FOUND
    {%- endif %}
    response = client.get(url)
    assert response.status_code == expected_status_code


def test_api_schema_generated_successfully(admin_client):
    {%- if dkcutter.restFramework == 'DRF' %}
    url = reverse("api-schema")
    {%- elif dkcutter.restFramework == 'DNRF' %}
    url = reverse("api-1.0.0:openapi-json")
    {%- endif %}
    response = admin_client.get(url)
    assert response.status_code == HTTPStatus.OK
