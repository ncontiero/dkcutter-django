{% if dkcutter.pkgManager == "bun" -%}
FROM docker.io/oven/bun:1.3.2-slim
{% else -%}
FROM docker.io/node:24.11.1-bookworm-slim
{% endif %}
ARG APP_HOME=/app
WORKDIR ${APP_HOME}

{% if dkcutter.pkgManager == "npm" -%}
COPY ./package.json ./package-lock.json* ${APP_HOME}
{% if "reactEmail" in dkcutter.additionalTools -%}
COPY ./emails/package.json ${APP_HOME}/emails/
{%- endif %}

RUN npm install && npm cache clean --force
{% elif dkcutter.pkgManager == "pnpm" -%}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY ./package.json ./pnpm-lock.yaml* ./pnpm-workspace.yaml* ${APP_HOME}
{% if "reactEmail" in dkcutter.additionalTools -%}
COPY ./emails/package.json ${APP_HOME}/emails/
{%- endif %}

RUN pnpm install
{% elif dkcutter.pkgManager == "yarn" -%}
RUN corepack enable

COPY ./package.json ./.yarnrc.yml ./yarn.lock* ${APP_HOME}
{% if "reactEmail" in dkcutter.additionalTools -%}
COPY ./emails/package.json ${APP_HOME}/emails/
{%- endif %}

RUN yarn install
{% elif dkcutter.pkgManager == "bun" -%}
COPY ./package.json ./bun.lock* ${APP_HOME}
{% if "reactEmail" in dkcutter.additionalTools -%}
COPY ./emails/package.json ${APP_HOME}/emails/
{%- endif %}

RUN bun install
{% endif %}
ENV PATH="${APP_HOME}/node_modules/.bin/:$PATH"
