{% if dkcutter._haveNodePackages -%}
{%- if dkcutter.pkgManager == "bun" -%}
FROM docker.io/oven/bun:1.3.7-slim AS client-base
{%- else -%}
FROM docker.io/node:24.13.0-bookworm-slim AS client-base
{%- endif %}

WORKDIR /app

{% if dkcutter.pkgManager == "npm" -%}
FROM client-base AS client-deps

COPY ./package.json ./package-lock.json* ./
{% if "reactEmail" in dkcutter.additionalTools -%}
COPY ./emails/package.json ./emails/
{%- endif %}

RUN --mount=type=cache,target=/root/.npm npm ci
{%- elif dkcutter.pkgManager == "pnpm" -%}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM client-base AS client-deps

COPY ./package.json ./pnpm-lock.yaml* ./pnpm-workspace.yaml* ./
{% if "reactEmail" in dkcutter.additionalTools -%}
COPY ./emails/package.json ./emails/
{%- endif %}

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
{%- elif dkcutter.pkgManager == "yarn" -%}
RUN corepack enable

FROM client-base AS client-deps

COPY ./package.json ./.yarnrc.yml ./yarn.lock* ./
{% if "reactEmail" in dkcutter.additionalTools -%}
COPY ./emails/package.json ./emails/
{%- endif %}

RUN --mount=type=cache,target=/root/.yarn/cache yarn install --frozen-lockfile
{%- elif dkcutter.pkgManager == "bun" -%}
FROM client-base AS client-deps

COPY ./package.json ./bun.lock* ./
{% if "reactEmail" in dkcutter.additionalTools -%}
COPY ./emails/package.json ./emails/
{%- endif %}

RUN --mount=type=cache,id=bun,target=/root/.bun bun install --frozen-lockfile
{%- endif %}

FROM client-base AS client-builder

{%- if not dkcutter.useWhitenoise and dkcutter.frontendPipeline in ["Rspack", "Webpack"] %}
{%- if dkcutter.cloudProvider == "AWS" %}

ARG DJANGO_AWS_STORAGE_BUCKET_NAME
ARG DJANGO_AWS_S3_CUSTOM_DOMAIN

ENV DJANGO_AWS_STORAGE_BUCKET_NAME=${DJANGO_AWS_STORAGE_BUCKET_NAME}
ENV DJANGO_AWS_S3_CUSTOM_DOMAIN=${DJANGO_AWS_S3_CUSTOM_DOMAIN}
{%- elif dkcutter.cloudProvider == "GCP" %}

ARG DJANGO_GCP_STORAGE_BUCKET_NAME

ENV DJANGO_GCP_STORAGE_BUCKET_NAME=${DJANGO_GCP_STORAGE_BUCKET_NAME}
{%- endif %}
{%- endif %}

COPY --from=client-deps /app/node_modules /app/node_modules
{% if "reactEmail" in dkcutter.additionalTools and dkcutter.pkgManager in ["pnpm", "bun"] -%}
COPY --from=client-deps /app/emails/node_modules /app/emails/node_modules
{%- endif %}
COPY . /app
{% if dkcutter.frontendPipeline in ["Rspack", "Webpack"] %}
RUN {{ dkcutter._pkgRun }} build
{%- endif %}
{%- if "reactEmail" in dkcutter.additionalTools %}
RUN {{ dkcutter._pkgRun }} build:email
{%- endif %}

FROM client-base AS client-build

COPY . /app
{%- if dkcutter.frontendPipeline in ["Rspack", "Webpack"] %}
COPY --from=client-builder /app/webpack-stats.json /app/webpack-stats.json
COPY --from=client-builder /app/{{ dkcutter.projectSlug }}/static/bundles /app/{{ dkcutter.projectSlug }}/static/bundles
{%- endif %}
{%- if "reactEmail" in dkcutter.additionalTools %}
COPY --from=client-builder /app/{{ dkcutter.projectSlug }}/templates/emails /app/{{ dkcutter.projectSlug }}/templates/emails
{%- endif %}

{% endif -%}
# define an alias for the specific python version used in this file.
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS python-build-stage

ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=0

ARG APP_HOME=/app

WORKDIR ${APP_HOME}

# Install apt packages
RUN apt-get update && apt-get install --no-install-recommends -y \
  # dependencies for building Python packages
  build-essential \
  # psycopg dependencies
  libpq-dev

# Requirements are installed here to ensure they will be cached.
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-dev

{% if dkcutter._haveNodePackages -%}
COPY --from=client-build ${APP_HOME} ${APP_HOME}
{%- else -%}
COPY . ${APP_HOME}
{%- endif %}

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-dev

# Python 'run' stage
FROM python:3.13-slim-bookworm AS python-run-stage

ARG APP_HOME=/app

WORKDIR ${APP_HOME}

RUN addgroup --system django \
  && adduser --system --ingroup django django

# Install required system dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
  # psycopg dependencies
  libpq5 \
  # entrypoint
  wait-for-it \
  # Translations dependencies
  gettext \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

COPY --chown=django:django ./compose/production/django/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

COPY --chown=django:django ./compose/production/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

{%- if dkcutter.useCelery %}
COPY --chown=django:django ./compose/production/django/celery/worker/start /start-celeryworker
RUN sed -i 's/\r$//g' /start-celeryworker
RUN chmod +x /start-celeryworker

COPY --chown=django:django ./compose/production/django/celery/beat/start /start-celerybeat
RUN sed -i 's/\r$//g' /start-celerybeat
RUN chmod +x /start-celerybeat

COPY --chown=django:django ./compose/production/django/celery/flower/start /start-flower
RUN sed -i 's/\r$//g' /start-flower
RUN chmod +x /start-flower
{%- endif %}

# Copy the application from the builder
COPY --from=python-build-stage --chown=django:django ${APP_HOME} ${APP_HOME}

{%- if dkcutter.cloudProvider == "None" %}

# explicitly create the media folder before changing ownership below
RUN mkdir -p ${APP_HOME}/{{ dkcutter.projectSlug }}/media
{%- endif %}

# make django owner of the WORKDIR directory as well.
RUN chown django:django ${APP_HOME}

# Place executables in the environment at the front of the path
ENV PATH="${APP_HOME}/.venv/bin:$PATH"

USER django

RUN DATABASE_URL="" \
  DJANGO_SETTINGS_MODULE="config.settings.test"

ENTRYPOINT ["/entrypoint"]
