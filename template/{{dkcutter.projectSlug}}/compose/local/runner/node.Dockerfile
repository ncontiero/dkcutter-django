{% if dkcutter.pkgManager == "bun" -%}
FROM docker.io/oven/bun:1.3.14-slim@sha256:d56a2534ffd262e92c12fd3249d3924d296d97086da773f821d7d0477435ea04
{% else -%}
FROM docker.io/node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df
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
