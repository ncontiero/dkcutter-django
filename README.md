# DKCutter Django

[![Build Status](https://img.shields.io/github/actions/workflow/status/ncontiero/dkcutter-django/ci.yml?branch=main)](https://github.com/ncontiero/dkcutter-django/actions/workflows/ci.yml?query=branch%3Amain)
[![license mit](https://img.shields.io/badge/licence-MIT-56BEB8)](LICENSE)
[![Code style: Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/format.json)](https://github.com/astral-sh/ruff)

Powered by [DKCutter](https://github.com/ncontiero/dkcutter), DKCutter Django is a robust template for jumpstarting production-ready Django projects quickly with modern tooling.

- If you have problems with DKCutter Django, please open an [issue](https://github.com/ncontiero/dkcutter-django/issues/new).

## Features

- ⚡️ **Django v6 & Python v3.14**: Modern setup with the latest best practices and configurations.
- 🗄️ **Database**: PostgreSQL support (versions 14 to 18) and optional PGAdmin via Docker Compose.
- ☁️ **Cloud Providers**: Native support for AWS (S3) or GCP (Google Cloud Storage) for static/media files, or WhiteNoise for local/no-cloud setups.
- 🔌 **REST API**: Choose between [Django REST framework (DRF)](https://www.django-rest-framework.org/) or [Django Ninja](https://django-ninja.rest-framework.com/).
- 📧 **Email Integration**: Built-in support for numerous email providers (Mailgun, SendGrid, Amazon SES, etc.) via Django Anymail, plus Mailpit for local testing. Support for modern email templates via [React Email](https://react.email/) with optional TailwindCSS.
- 🎨 **Frontend Pipeline**: Optional Rspack or Webpack configuration with TypeScript/JavaScript support and TailwindCSS integration.
- ⚙️ **Background Tasks**: Integrated [Celery](https://docs.celeryq.dev/) support.
- 🐛 **Error Tracking**: Built-in [Sentry](https://sentry.io/) configuration.
- 🛠️ **Code Quality**: Pre-configured Python linting with Ruff. Optional ESLint (with or without Type Information) for the frontend.
- 🤖 **Dependency Automation**: Keep your project up-to-date automatically using Mend Renovate or GitHub Dependabot.
- 📦 **Modern Tooling**: Recommended setup with `uv` for Python dependencies and npm/yarn/pnpm/bun for the frontend.

## Usage

> [!NOTE]
> Docker is recommended for setting up your project. Alternatively, ensure you have the latest version of [uv](https://docs.astral.sh/uv/getting-started/installation/) installed. If you choose a frontend pipeline or React Email, you will also need a Node.js package manager (npm, pnpm, yarn, or bun).

To scaffold an application using [DKCutter](https://github.com/ncontiero/dkcutter), run any of the following commands and answer the command prompt questions:

### npm

```bash
npx dkcutter@latest gh:ncontiero/dkcutter-django
```

### yarn

```bash
yarn dlx dkcutter@latest gh:ncontiero/dkcutter-django
```

### pnpm

```bash
pnpm dlx dkcutter@latest gh:ncontiero/dkcutter-django
```

### bun

```bash
bunx dkcutter@latest gh:ncontiero/dkcutter-django
```

You'll be prompted for some values. Provide them, and a tailored Django project will be created for you.

**Warning**: After generation, ensure you update 'author name' and other specific details to your own information.

Answer the prompts with your own desired [options][options-url]. For example:

```bash
✔ What is the project name? … My Awesome Project
✔ What is the project slug? … my_awesome_project
✔ What is the project description? … Behold My Awesome Project!
✔ What is the author name? … Nicolas Contiero
✔ What is the domain name? … example.com
✔ What is the email address? … nicolas-contiero@example.com
✔ What Username Type would you like to use? › username / email
✔ What PostgreSQL version would you like to use? › 18 / 17 / 16 / 15 / 14
✔ What Cloud Provider would you like to use? › AWS / GCP / None
✔ What Rest Framework would you like to use? › None / Django Rest Framework / Django Ninja Rest Framework
✔ What Mail Service would you like to use? › Mailgun / Amazon SES / Mailjet / Mandrill / Postmark / Sendgrid / Brevo / SparkPost / Other SMTP / None
✔ What Frontend Pipeline would you like to use? › None / Rspack / Webpack
✔ What Frontend Pipeline Language would you like to use? › TypeScript / JavaScript
✔ Select additional tools: › Add React Email, Add TailwindCSS, Add ESLint, Add ESLint with Type Information, Add Mailpit, Add Celery, Add Sentry, Add WhiteNoise, Add PGAdmin
✔ Do you want to use TailwindCSS in React Email? … No / Yes
✔ What Package Manager would you like to use? › npm / Yarn / pnpm / bun
✔ What Automated Dependency Updater do you want to use? › None / Mend Renovate / Github Dependabot
✔ Do you want to install the frontend dependencies now? … No / Yes
✔ Do you want to initialize a git repository now? … No / Yes

✔ Project created!
```

Enter the project and take a look around:

```bash
cd my_awesome_project/
ls
```

Now take a look at your repo. Don't forget to carefully look at the generated `README.md`.

## Advanced usage

If you want to bypass the interactive prompts and start faster, you can provide configuration via CLI flags. All options in `dkcutter.json` are available as flags:

| Flag                                  | Description                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `--projectName <string>`              | Your project's human-readable name.                                                                                                         |
| `--projectSlug <string>`              | Your project's slug without dashes or spaces.                                                                                               |
| `--description <string>`              | Describes your project.                                                                                                                     |
| `--authorName <string>`               | The author name.                                                                                                                            |
| `--domainName <string>`               | The domain name you plan to use for your project once it goes live.                                                                         |
| `--email <string>`                    | The email address you want to identify yourself in the project.                                                                             |
| `--usernameType <string>`             | Select whether the user will log in using `username` or `email`.                                                                            |
| `--postgresqlVersion <string>`        | Select a PostgreSQL version to use (`18`, `17`, `16`, `15`, `14`).                                                                          |
| `--cloudProvider <string>`            | Select a cloud provider for static & media files (`AWS`, `GCP`, `None`).                                                                    |
| `--restFramework <string>`            | Select a REST API framework (`None`, `DRF`, `DNRF`).                                                                                        |
| `--mailService <string>`              | Select an email service (e.g., `Mailgun`, `Sendgrid`, `None`).                                                                              |
| `--frontendPipeline <string>`         | Select a pipeline to compile frontend assets (`None`, `Rspack`, `Webpack`).                                                                 |
| `--frontendPipelineLang <string>`     | Select the language used by the Frontend Pipeline (`ts`, `js`).                                                                             |
| `--additionalTools <string>`          | Comma-separated list of tools (`reactEmail`, `tailwindcss`, `eslint`, `eslint-ts`, `mailpit`, `celery`, `sentry`, `whitenoise`, `pgadmin`). |
| `--useTailwindInReactEmail [boolean]` | Select if you want to use TailwindCSS in React Email.                                                                                       |
| `--pkgManagerToUse <string>`          | Select the package manager for the frontend (`npm`, `yarn`, `pnpm`, `bun`).                                                                 |
| `--automatedDepsUpdater <string>`     | Choose Automated Dependency Updater (`none`, `renovate`, `dependabot`).                                                                     |
| `--installFrontendDeps [boolean]`     | Select if you want to install frontend dependencies.                                                                                        |
| `--initializeGit [boolean]`           | Select if you want to initialize a Git repository.                                                                                          |

[See here for more information about options][options-url].

### Examples

The following would be the structure of an application with Sentry:

```bash
pnpm dlx dkcutter gh:ncontiero/dkcutter-django --additionalTools sentry
```

If you want to use all the default values with the exception of one or more, you can do it as follows:

```bash
pnpm dlx dkcutter gh:ncontiero/dkcutter-django --additionalTools celery,sentry -y
```

This will use the default values except for `--additionalTools`, skipping the interactive prompt (`-y`).

## For local development, see the following

- [Developing locally using docker](./docs/developing-locally-docker.md)

[options-url]: ./docs/project-generation-options.md

## References and inspirations

- [Cookiecutter Django](https://github.com/cookiecutter/cookiecutter-django) - A framework for jumpstarting production-ready Django projects quickly.

## License

This project is licensed under the **MIT** License - see the [LICENSE](./LICENSE) file for details.
