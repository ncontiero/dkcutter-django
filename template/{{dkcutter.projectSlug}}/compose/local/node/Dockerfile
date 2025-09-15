{% if dkcutter.pkgManager == "bun" -%}
FROM docker.io/oven/bun:1.2.22-slim
{% else -%}
FROM docker.io/node:22.19.0-bookworm-slim
{% endif %}
WORKDIR /app

{% if dkcutter.pkgManager == "npm" -%}
COPY package.json package-lock.json ./

RUN npm install && npm cache clean --force
{% elif dkcutter.pkgManager == "pnpm" -%}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install
{% elif dkcutter.pkgManager == "yarn" -%}
RUN corepack enable

COPY package.json yarn.lock ./

RUN yarn install
{% elif dkcutter.pkgManager == "bun" -%}
COPY package.json bun.lock ./

RUN bun install
{% endif %}
ENV PATH=./node_modules/.bin/:$PATH

{% if dkcutter.pkgManager == "bun" -%}
RUN chown bun:bun /app
USER bun
{% else -%}
RUN chown node:node /app
USER node
{% endif -%}
