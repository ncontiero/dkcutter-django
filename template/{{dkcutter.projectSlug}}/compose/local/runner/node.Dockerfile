{% if dkcutter.pkgManager == "bun" -%}
FROM docker.io/oven/bun:1.4.3-slim@sha256:14a223fa35747ec728bce300ef85888bc5f7958164d15bbba6a54b22b52a3288
{% else -%}
FROM docker.io/node:24.21.0-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20
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
