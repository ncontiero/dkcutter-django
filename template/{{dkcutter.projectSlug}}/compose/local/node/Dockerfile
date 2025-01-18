FROM docker.io/node:22-bookworm-slim

WORKDIR /app

COPY ./package.json /app

RUN npm install && npm cache clean --force

ENV PATH=./node_modules/.bin/:$PATH

RUN chown -R node:node /app && chmod -R 755 /app
USER node
