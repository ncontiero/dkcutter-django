FROM docker.io/node:24.22.2-bookworm-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c

ARG APP_HOME=/app
WORKDIR ${APP_HOME}

{% if dkcutter.pkgManager == "npm" -%}
COPY ./package.json ./package-lock.json* ${APP_HOME}
{%- if dkcutter.useReactEmail %}
COPY ./emails/package.json ${APP_HOME}/emails/
{%- endif %}

RUN npm install && npm cache clean --force
{% elif dkcutter.pkgManager == "pnpm" -%}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY ./package.json ./pnpm-lock.yaml* ./pnpm-workspace.yaml* ${APP_HOME}
{%- if dkcutter.useReactEmail %}
COPY ./emails/package.json ${APP_HOME}/emails/
{%- endif %}

RUN pnpm install
{% elif dkcutter.pkgManager == "yarn" -%}
RUN corepack enable

COPY ./package.json ./.yarnrc.yml ./yarn.lock* ${APP_HOME}
{%- if dkcutter.useReactEmail %}
COPY ./emails/package.json ${APP_HOME}/emails/
{%- endif %}

RUN yarn install
{% elif dkcutter.pkgManager == "bun" -%}
COPY --from=docker.io/oven/bun:1.4.4-slim@sha256:1846adf22496bd711036aae8be147e57bdebbaea2e5264e3e0b5af1db187d9a4 \
  /usr/local/bin/bun \
  /usr/local/bin/bun

COPY ./package.json ./bun.lock* ${APP_HOME}
{%- if dkcutter.useReactEmail %}
COPY ./emails/package.json ${APP_HOME}/emails/
{%- endif %}

RUN bun install
{% endif %}
ENV PATH="${APP_HOME}/node_modules/.bin/:$PATH"
