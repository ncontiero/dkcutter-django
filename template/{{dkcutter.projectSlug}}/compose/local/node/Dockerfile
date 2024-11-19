FROM docker.io/node:22.11.0-bookworm-slim

WORKDIR /app

COPY ./package.json /app

RUN npm install && npm cache clean --force

ENV PATH=./node_modules/.bin/:$PATH
