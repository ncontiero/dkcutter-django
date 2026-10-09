FROM docker.io/node:24.21.0-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20

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
COPY --from=docker.io/oven/bun:1.4.2-slim@sha256:cb3bbbb08e13a4a2ff400f24c7a2a1d5efa83f6ef8544d52d95a519631e2fc61 \
  /usr/local/bin/bun \
  /usr/local/bin/bun

COPY ./package.json ./bun.lock* ${APP_HOME}
{%- if dkcutter.useReactEmail %}
COPY ./emails/package.json ${APP_HOME}/emails/
{%- endif %}

RUN bun install
{% endif %}
ENV PATH="${APP_HOME}/node_modules/.bin/:$PATH"
