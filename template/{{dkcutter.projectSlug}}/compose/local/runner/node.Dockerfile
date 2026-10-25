{% if dkcutter.pkgManager == "bun" -%}
FROM docker.io/oven/bun:1.4.4-slim@sha256:1846adf22496bd711036aae8be147e57bdebbaea2e5264e3e0b5af1db187d9a4
{% else -%}
FROM docker.io/node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205
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
