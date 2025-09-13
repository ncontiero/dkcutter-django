#!/bin/sh
# this is a very simple script that tests the docker configuration for dkcutter-django
# it is meant to be run from the root directory of the repository, eg:
# sh tests/test_docker.sh

set -o errexit
set -x
set -e

finish() {
  docker compose -f docker-compose.local.yml down --remove-orphans
  docker volume rm my_awesome_project_my_awesome_project_local_postgres_data
}

# the cleanup doesn't work in the GitHub actions
if [ -z "$GITHUB_ACTIONS" ]; then
  trap finish EXIT
fi

# create a cache directory
mkdir -p .cache/docker
cd .cache/docker

sudo rm -rf my_awesome_project

# create the project using the default settings in dkcutter.json
pnpm generate -o .cache/docker -y -f "$@"
cd my_awesome_project

# make sure all images build
docker compose -f docker-compose.local.yml build

docker compose -f docker-compose.local.yml run django uv lock

docker compose -f docker-compose.local.yml build

# run the project's type checks
docker compose -f docker-compose.local.yml run --rm django mypy my_awesome_project

# run the project's tests
docker compose -f docker-compose.local.yml run --rm django pytest -p no:cacheprovider

# return non-zero status code if there are migrations that have not been created
docker compose -f docker-compose.local.yml run --rm django python manage.py makemigrations --check || {
  echo "ERROR: there were changes in the models, but migration listed above have not been created and are not saved in version control"
  exit 1
}

# Make sure the check doesn't raise any warnings
docker compose -f docker-compose.local.yml run --rm \
  -e DJANGO_SECRET_KEY="$(openssl rand -base64 64)" \
  -e REDIS_URL=redis://redis:6379/0 \
  -e DJANGO_AWS_ACCESS_KEY_ID=x \
  -e DJANGO_AWS_SECRET_ACCESS_KEY=x \
  -e DJANGO_AWS_STORAGE_BUCKET_NAME=x \
  -e DJANGO_ADMIN_URL=x \
  -e MAILGUN_API_KEY=x \
  -e MAILGUN_DOMAIN=x \
  django python manage.py check --settings=config.settings.production --deploy --database default --fail-level WARNING

docker build -f ./compose/production/django/Dockerfile -t django-prod .

docker run --rm \
  --env-file .envs/.local/.django \
  --env-file .envs/.local/.postgres \
  --network my_awesome_project_default \
  -e DJANGO_SECRET_KEY="$(openssl rand -base64 64)" \
  -e REDIS_URL=redis://redis:6379/0 \
  -e DJANGO_AWS_ACCESS_KEY_ID=x \
  -e DJANGO_AWS_SECRET_ACCESS_KEY=x \
  -e DJANGO_AWS_STORAGE_BUCKET_NAME=x \
  -e DJANGO_ADMIN_URL=x \
  -e MAILGUN_API_KEY=x \
  -e MAILGUN_DOMAIN=x \
  django-prod python manage.py check --settings=config.settings.production --deploy --database default --fail-level WARNING

# Run npm build script if package.json is present
if [ -f "package.json" ]; then
  docker compose -f docker-compose.local.yml run --rm node npm run build
fi

# Run npm lint script if eslint.config.mjs is present
if [ -f "eslint.config.mjs" ]; then
  docker compose -f docker-compose.local.yml run --rm node npm run lint
fi
