# Deployment with Docker

## Prerequisites

- Docker 17.05+.
- Docker Compose 1.17+

## Understanding the Docker Compose Setup

Before you begin, check out the production.yml file in the root of this project. Keep note of how it provides configuration for the following services:

- `django`: your application running behind `Gunicorn`;
- `postgres`: PostgreSQL database with the application's relational data;
- `redis`: Redis instance for caching;

Provided you have opted for Celery (via setting `use_celery` to `y`) there are three more services:

- `celeryworker` running a Celery worker process;
- `celerybeat` running a Celery beat process;
- `flower` running [Flower](https://github.com/mher/flower).

For more information about Flower and its login credentials, check out [CeleryFlower](./developing-locally-docker.md#celery-flower) instructions for local environment.

## Configuring the Stack

The majority of services above are configured through the use of environment variables. Just check out [Configuring the Environment](./developing-locally-docker.md#configuring-the-environment) and you will know the drill.

To obtain logs and information about crashes in a production setup, make sure that you have access to an external Sentry instance (e.g. by creating an account with [sentry.io](https://sentry.io/welcome)), and set the `SENTRY_DSN` variable. Logs of level _logging.ERROR_ are sent as Sentry events. Therefore, in order to send a Sentry event use:

```python
import logging
logging.error("This event is sent to Sentry", extra={"<example_key>": "<example_value>"})
```

The _extra_ parameter allows you to send additional information about the context of this error.

You will probably also need to setup the Mail backend, for example by adding a [Mailgun](https://mailgun.com/) API key and a [Mailgun](https://mailgun.com/) sender domain, otherwise, the account creation view will crash and result in a 500 error when the backend attempts to send an email to the account owner.

## Building & Running Production Stack

You will need to build the stack first. To do that, run:

```bash
docker-compose -f production.yml build
```

Once this is ready, you can run it with:

```bash
docker-compose -f production.yml up
```

To run the stack and detach the containers, run:

```bash
docker-compose -f production.yml up -d
```

To run a migration, open up a second terminal and run:

```bash
docker-compose -f production.yml run --rm django python manage.py migrate
```

To create a superuser, run:

```bash
docker-compose -f production.yml run --rm django python manage.py createsuperuser
```

To check the logs out, run:

```bash
docker compose -f production.yml logs
```

If you want to scale your application, run:

```bash
docker compose -f production.yml up --scale django=4
docker compose -f production.yml up --scale celeryworker=2
```

**⚠ Warning** : don't try to scale `postgres`, `celerybeat`, or `traefik`.

To see how your containers are doing run:

```bash
docker compose -f production.yml ps
```

## Media files without cloud provider

The media files will be served by an nginx service, from a `production_django_media` volume. Make sure to keep this around to avoid losing any media files.
