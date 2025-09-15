{% if dkcutter.pkgManager == "bun" -%}
FROM docker.io/oven/bun:1.2.22-slim
{% else -%}
FROM docker.io/node:22.19.0-bookworm-slim
{% endif %}

{%- if dkcutter.pkgManager == "pnpm" %}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
{% endif -%}

WORKDIR /app

{% if dkcutter.pkgManager != "bun" -%}
RUN corepack enable
{% endif -%}

RUN chown node:node /app
USER node
