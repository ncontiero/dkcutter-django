{% if dkcutter.pkgManager == "bun" -%}
FROM docker.io/oven/bun:1.2.22-slim
{% else -%}
FROM docker.io/node:22.19.0-bookworm-slim
{% endif %}
WORKDIR /app

{% if dkcutter.pkgManager == "pnpm" -%}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

{% endif -%}

{% if dkcutter.pkgManager != "bun" -%}
RUN corepack enable
{% endif -%}
