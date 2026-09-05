{% if dkcutter.pkgManager == "bun" -%}
FROM docker.io/oven/bun:1.4.0-slim@sha256:e0ee68d16ccb9927bf02aa7dd8fd4bf3369ee6d46da04faa72b05ce8bfd135f6
{% else -%}
FROM docker.io/node:24.20.0-bookworm-slim@sha256:ba849c60be29959425b8734d57b8b4b7d56f98edd9504c9af091d5281095a71e
{% endif %}
ARG APP_HOME=/app
ENV HOME=${APP_HOME}
WORKDIR ${APP_HOME}

{% if dkcutter.pkgManager == "pnpm" -%}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

{% endif -%}

{% if dkcutter.pkgManager != "bun" -%}
RUN corepack enable
{% endif -%}

{% if dkcutter.pkgManager == "bun" -%}
RUN chown bun:bun ${APP_HOME}
USER bun
{% else -%}
RUN chown node:node ${APP_HOME}
USER node
{% endif -%}
