# Project Generation Options

This page describes all the template options that will be prompted by the [dkcutter CLI](https://github.com/dkshs/dkcutter) prior to generating your project.

- **Project name**: Your project's human-readable name, capitals and spaces allowed.

- **Project slug**: Your project's slug without dashes or spaces. Used to name your repo and in other places where a Python-importable version of your project name is needed.

- **Project description**: Describes your project and gets used in places like README.md and such.

- **Author name**: This is you! The value goes into places like LICENSE and such.

- **Domain name**: The domain name you plan to use for your project once it goes live. Note that it can be safely changed later on whenever you need to.

- **Email**: The email address you want to identify yourself in the project.

- **PostgreSQL version**: Select a [PostgreSQL](https://www.postgresql.org/docs/) version to use. The choices are:

  - 16
  - 15
  - 14
  - 13
  - 12

- **Cloud Provider**: Select a cloud provider for static & media files. The choices are:

  - [AWS](https://aws.amazon.com/s3/)
  - [GCP](https://cloud.google.com/storage)
  - None

  If you choose no cloud provider, the production stack will serve the media files via an nginx Docker service. Without Docker, the media files won't work.

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

- **Use mailpit**: Indicates whether the project should be configured to use [Mailpit](https://github.com/axllent/mailpit/).

- **Use celery**: Indicates whether the project should be configured to use [Celery](https://github.com/celery/celery).

- **Use sentry**: Indicates whether the project should be configured to use [Sentry](https://github.com/getsentry/sentry).

- **Use whitenoise**: Indicates whether the project should be configured to use [WhiteNoise](https://github.com/evansd/whitenoise).

- **Use pgadmin**: Indicates whether the project should be configured to use [pgAdmin](https://www.pgadmin.org/).

- **Use tailwindcss**: Indicates whether the project should be configured to use [TailwindCSS](https://tailwindcss.com/).

- **Automated Deps Updater**: Indicates whether the project should be configured using the following automated deps updater:

  - None
  - [Mend Renovate](https://docs.renovatebot.com/)
  - [Github Dependabot](https://docs.github.com/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
