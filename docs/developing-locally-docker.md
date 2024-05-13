# Getting Up and Running Locally With Docker

## Prerequisites

- Docker; if you don't have it yet, follow the [installation instructions](https://docs.docker.com/get-docker/#supported-platforms).
- Docker Compose; refer to the official documentation for the [installation guide](https://docs.docker.com/compose/install/).
- DKCutter; refer to the official GitHub repository of [DKCutter](https://github.com/dkshs/dkcutter).

## Before Getting Started

Generate a new django project:

```bash
npx dkcutter@latest gh:dkshs/dkcutter-django
```

For more information refer to [Project Generation Options](./project-generation-options.md).

## Build the Stack

This can take a while, especially the first time you run this particular command on your development system:

```bash
docker-compose -f docker-compose.local.yml build
```

Generally, if you want to emulate production environment use `docker-compose.production.yml` instead. And this is true for any other actions you might need to perform: whenever a switch is required, just do it!

## Run the Stack

This brings up both Django, PostgreSQL and PGAdmin. The first time it is run it might take a while to get started, but subsequent runs will occur quickly.

Open a terminal at the project root and run the following for local development:

```bash
docker-compose -f docker-compose.local.yml up
```

You can also set the environment variable `COMPOSE_FILE` pointing to `docker-compose.local.yml` like this:

```bash
export COMPOSE_FILE=docker-compose.local.yml
```

And then run:

```bash
docker-compose up
```

To run in a detached (background) mode, just:

```bash
docker-compose up -d
```

The site should start and be accessible at <http://localhost:8000>.

## Execute Management Commands

As with any shell command that we wish to run in our container, this is done using the `docker-compose -f docker-compose.local.yml run --rm` command:

```bash
docker-compose -f docker-compose.local.yml run --rm django python manage.py migrate
docker-compose -f docker-compose.local.yml run --rm django python manage.py createsuperuser
```

Here, `django` is the target service we are executing the commands against. Also, please note that the `docker exec` does not work for running management commands.

## Configuring the Environment

This is the excerpt from your project’s `docker-compose.local.yml`:

```yml
# ...

postgres:
  build:
    context: .
    dockerfile: ./compose/production/postgres/Dockerfile
  volumes:
    - local_postgres_data:/var/lib/postgresql/data
    - local_postgres_data_backups:/backups
  env_file:
    - ./.envs/.local/.postgres
# ...
```

The most important thing for us here now is `env_file` section enlisting `./.envs/.local/.postgres`. Generally, the stack’s behavior is governed by a number of environment variables (env(s), for short) residing in `envs/`, for instance, this is what we generate for you:

```bash
.envs
├── .local
│   ├── .django
│   ├── .postgres
└── .production
    ├── .django
    └── .postgres
```

Consider the aforementioned `.envs/.local/.postgres`:

```env
# PostgreSQL
# ------------------------------------------------------------------------------
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=<your project slug>
POSTGRES_USER=49nKf38fzX92JGfHjgpX5UyAv5RZ6q
POSTGRES_PASSWORD=awWYmw3K9b5m7WT62wxFySQY6wkgy25u3zHVT7NWJyCN9unuFbov69cuiL2U
```

The three envs we are presented with here are `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` (by the way, their values have also been generated for you). You might have figured out already where these definitions will end up; it’s all the same with `django` service container envs.

## Tips & Tricks

### Add 3rd party python packages

To install a new 3rd party python package, you cannot use `pip install <package_name>`, that would only add the package to the container. The container is ephemeral, so that new library won’t be persisted if you run another container. Instead, you should modify the Docker image: You have to modify the relevant requirement file: base, local or production by adding:

```txt
<package_name>==<package_version>
```

To get this change picked up, you’ll need to rebuild the image(s) and restart the running container:

```bash
docker compose -f docker-compose.local.yml build
docker compose -f docker-compose.local.yml up
```

### Debugging

#### django-debug-toolbar

In order for `django-debug-toolbar` to work designate your Docker Machine IP with `INTERNAL_IPS` in `config/settings/local.py`.

#### docker

The `container_name` from the yml file can be used to check on containers with docker commands, for example:

```bash
docker logs <project_slug>_local_celeryworker
docker top <project_slug>_local_celeryworker
```

Notice that the `container_name` is generated dynamically using your project slug as a prefix.

### Mailpit

When developing locally you can go with [Mailpit](https://github.com/axllent/mailpit/) for email testing provided `use_mailpit` was set to `y` on setup. To proceed,

1. make sure `<project_slug>_local_mailpit` container is up and running;
2. open up <http://127.0.0.1:8025>.

### Celery tasks in local development

If you need tasks to be executed on the main thread during development set `CELERY_TASK_ALWAYS_EAGER = True` in `config/settings/local.py`.

Possible uses could be for testing, or ease of profiling with DJDT.

### Celery Flower

[Flower](https://github.com/mher/flower) is a “real-time monitor and web admin for Celery distributed task queue”.

Prerequisites:

- `use_celery` was set to `y` on project initialization.

By default, it’s enabled both in local and production environments (`docker-compose.local.yml` and `docker-compose.production.yml` Docker Compose configs, respectively) through a `flower` service. For added security, `flower` requires its clients to provide authentication credentials specified as the corresponding environments’ `.envs/.local/.django` and `.envs/.production/.django` `CELERY_FLOWER_USER` and `CELERY_FLOWER_PASSWORD` environment variables. Check out <http://localhost:5555> and see for yourself.
