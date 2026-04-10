{% if dkcutter.restFramework == 'DRF' -%}
from django.conf import settings
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter
{% elif dkcutter.restFramework == 'DNRF' -%}
from typing import TYPE_CHECKING

import orjson
from django.contrib.admin.views.decorators import staff_member_required
from ninja import NinjaAPI
from ninja.parser import Parser

if TYPE_CHECKING:
    from django.http import HttpRequest

{% endif %}

{%- if dkcutter.restFramework == 'DRF' %}
router = DefaultRouter() if settings.DEBUG else SimpleRouter()

urlpatterns = router.urls
app_name = "api"
{%- elif dkcutter.restFramework == 'DNRF' %}
class ORJSONParser(Parser):
    def parse_body(self, request: HttpRequest):
        return orjson.loads(request.body)


api = NinjaAPI(
    parser=ORJSONParser(),
    docs_decorator=staff_member_required,
    title="{{ dkcutter.projectName }} API",
    description="Documentation of API endpoints of {{ dkcutter.projectName }}",
    version="1.0.0",
)

# Your stuff: custom routers/api urls go here
{%- endif %}
