#!/bin/sh
# this is a very simple script that tests the docker configuration for dkcutter-django
# it is meant to be run from the root directory of the repository, eg:
# sh tests/test_docker.sh

set -o errexit
set -x
set -e

DOCKER_CMD="docker compose -f docker-compose.local.yml run --rm"

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
$DOCKER_CMD django mypy my_awesome_project

# run the project's tests
$DOCKER_CMD django pytest -p no:cacheprovider

# return non-zero status code if there are migrations that have not been created
$DOCKER_CMD django python manage.py makemigrations --check || {
  echo "ERROR: there were changes in the models, but migration listed above have not been created and are not saved in version control"
  exit 1
}

# Make sure the check doesn't raise any warnings
$DOCKER_CMD \
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

# Detect the package manager based on the lock file
if [ -f "package-lock.json" ]; then
  package_manager="npm"
elif [ -f "pnpm-lock.yaml" ]; then
  package_manager="pnpm"
elif [ -f "yarn.lock" ]; then
  package_manager="yarn"
# Note: Bun's lockfile is typically binary and named 'bun.lockb'
elif [ -f "bun.lockb" ] || [ -f "bun.lock" ]; then
  package_manager="bun"
fi

# If a package manager was detected, run the commands
if [ -n "$package_manager" ]; then
  # Run the build script if script is present
  if [ -f "webpack" ] || [ -f "rspack" ]; then
      $DOCKER_CMD node $package_manager run build
  fi

  # Run the build email script if the emails folder is present
  if [ -f "emails/package.json" ]; then
      $DOCKER_CMD node $package_manager run build:email
  fi

  # Run the lint script if the ESLint config file is present
  if [ -f "eslint.config.mjs" ]; then
      $DOCKER_CMD node $package_manager run lint
  fi
else
  echo "⚠️ No lock file (package-lock.json, pnpm-lock.yaml, yarn.lock, or bun.lockb) found. Nothing to do."
fi
