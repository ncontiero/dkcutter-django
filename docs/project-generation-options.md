# Project Generation Options

This page describes all the template options that will be prompted by the [dkcutter CLI](https://github.com/ncontiero/dkcutter) prior to generating your project.

- **Project name**: Your project's human-readable name, capitals and spaces allowed.

- **Project slug**: Your project's slug without dashes or spaces. Used to name your repo and in other places where a Python-importable version of your project name is needed.

- **Project description**: Describes your project and gets used in places like README.md and such.

- **Author name**: This is you! The value goes into places like LICENSE and such.

- **Domain name**: The domain name you plan to use for your project once it goes live. Note that it can be safely changed later on whenever you need to.

- **Email**: The email address you want to identify yourself in the project.

- **PostgreSQL version**: Select a [PostgreSQL](https://www.postgresql.org/docs/) version to use. The choices are:
  - 17
  - 16
  - 15
  - 14

- **Cloud Provider**: Select a cloud provider for static & media files. The choices are:
  - [AWS](https://aws.amazon.com/s3/)
  - [GCP](https://cloud.google.com/storage)
  - None

  If you choose no cloud provider, the production stack will serve the media files via an Nginx Docker service. Without Docker, the media files won't work.

- **Rest Framework**: Select a REST API framework. The choices are:
  - None
  - [Django REST framework](https://www.django-rest-framework.org/)
  - [Django Ninja REST framework](https://django-ninja.rest-framework.com/)

- **Mail Service**: Select an email service that Django-Anymail provides:
  - [Mailgun](https://www.mailgun.com/)
  - [Amazon SES](https://aws.amazon.com/ses/)
  - [Mailjet](https://www.mailjet.com/)
  - [Mandrill](http://mandrill.com/)
  - [Postmark](https://postmarkapp.com/)
  - [SendGrid](https://sendgrid.com/)
  - [Brevo (formerly SendinBlue)](https://www.brevo.com/)
  - [SparkPost](https://www.sparkpost.com/)
  - [Other SMTP](https://anymail.readthedocs.io/en/stable/)
  - None

- **Frontend Pipeline**: Select a pipeline to compile and optimize frontend assets (JS, CSS, …):
  - None
  - [Rspack](https://rspack.dev/)
  - [Webpack](https://webpack.js.org/)

- **Frontend Pipeline Lang**: Select the language used by the Frontend Pipeline:
  - JavaScript
  - TypeScript

- **Additional Tools**: Select additional tools to use:
  - [React Email](https://react.email/)
  - [TailwindCSS](https://tailwindcss.com/)
  - [ESLint](https://eslint.org/)
  - [Mailpit](https://github.com/axllent/mailpit)
  - [Celery](https://github.com/celery/celery)
  - [Sentry](https://github.com/getsentry/sentry)
  - [WhiteNoise](https://github.com/evansd/whitenoise)
  - [PGAdmin](https://www.pgadmin.org/)

- **Use TailwindCSS in React Email**: Indicates whether the project should use TailwindCSS in React Email (It is not necessary to have chosen TailwindCSS in the additional tools option).

- **Frontend Package Manager**: Select the package manager for the Frontend Pipeline:
  - npm
  - pnpm
  - Yarn
  - bun

- **Automated Deps Updater**: Indicates whether the project should be configured using the following automated deps updater:
  - None
  - [Mend Renovate](https://docs.renovatebot.com/)
  - [Github Dependabot](https://docs.github.com/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)

- **Install Dependencies**: Install dependencies after generating the project. This requires that you have the selected Node.js package manager and [uv](https://docs.astral.sh/uv/getting-started/installation/), or Docker installed on your machine.
