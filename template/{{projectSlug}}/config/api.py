{% if restFramework == 'DRF' -%}
from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter
{% elif restFramework == 'DNRF' -%}
from django.contrib.admin.views.decorators import staff_member_required
from ninja import NinjaAPI

import orjson
from ninja.parser import Parser
from django.http import HttpRequest

{% endif %}

{%- if restFramework == 'DRF' %}
router = DefaultRouter() if settings.DEBUG else SimpleRouter()

urlpatterns = router.urls
app_name = "api"
{%- elif restFramework == 'DNRF' %}
class ORJSONParser(Parser):
    def parse_body(self, request: HttpRequest):
        return orjson.loads(request.body)


api = NinjaAPI(
    parser=ORJSONParser(),
    docs_decorator=staff_member_required,
    title="{{ projectName }} API",
    description="Documentation of API endpoints of {{ projectName }}",
    version="1.0.0",
)

# Your stuff: custom routers/api urls go here
{%- endif %}
