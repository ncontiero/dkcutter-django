# {{dkcutter.projectName}}

[![license mit](https://img.shields.io/badge/licence-MIT-56BEB8)](LICENSE)
[![Built with DKCutter Django](https://img.shields.io/badge/built%20with-DKCutter%20Django-56BEB8.svg)](https://github.com/dkshs/dkcutter-django)
[![Black code style](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/ambv/black)

{{ dkcutter.description }}

## Settings

Moved to [settings](https://github.com/dkshs/dkcutter-django/blob/master/docs/settings.md).

## Basic Commands

### Setting Up Your Users

- To create a **superuser account**, use this command:

```bash
python manage.py createsuperuser
```

### Type checks

Running type checks with mypy:

```bash
mypy {{dkcutter.projectSlug}}
```

### Test coverage

To run the tests, check your test coverage, and generate an HTML coverage report:

```bash
coverage run -m pytest
coverage html
open htmlcov/index.html
```

#### Running tests with pytest

```bash
pytest
```

{%- if dkcutter.useCelery %}

### Celery

This app comes with Celery.

To run a celery worker:

```bash
cd {{dkcutter.projectSlug}}
celery -A config.celery_app worker -l info
```

Please note: For Celery's import magic to work, it is important where the celery commands are run. If you are in the same folder with *manage.py*, you should be right.

To run [periodic tasks](https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html), you'll need to start the celery beat scheduler service. You can start it as a standalone process:

```bash
cd {{dkcutter.projectSlug}}
celery -A config.celery_app beat
```

or you can embed the beat service inside a worker with the -B option (not recommended for production use):

```bash
cd {{dkcutter.projectSlug}}
celery -A config.celery_app worker -B -l info
```

{%- endif %}
{%- if dkcutter.useMailpit %}

### Email Server

In development, it is often nice to be able to see emails that are being sent from your application. For that reason local SMTP server [Mailpit](https://github.com/axllent/mailpit/) with a web interface is available as docker container.

Container mailpit will start automatically when you will run all docker containers.
Please check [cookiecutter-django Docker documentation](https://github.com/dkshs/dkcutter-django/blob/main/docs/deployment-with-docker.md) for more details how to start all containers.

With Mailpit running, to view messages that are sent by your application, open your browser and go to `http://127.0.0.1:8025`

{%- endif %}
{%- if dkcutter.useSentry %}

### Sentry

Sentry is an error logging aggregator service. You can sign up for a free account at <https://sentry.io/signup/> or download and host it yourself.
The system is set up with reasonable defaults, including 404 logging and integration with the WSGI application.

You must set the DSN url in production.
{%- endif %}

## Deployment

The following details how to deploy this application.

### Docker

See detailed [Docker documentation](https://github.com/dkshs/dkcutter-django/blob/main/docs/deployment-with-docker.md).
