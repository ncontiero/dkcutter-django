# DKCutter Django

[![Build Status](https://img.shields.io/github/actions/workflow/status/ncontiero/dkcutter-django/ci.yml?branch=main)](https://github.com/ncontiero/dkcutter-django/actions/workflows/ci.yml?query=branch%3Amain)
[![license mit](https://img.shields.io/badge/licence-MIT-56BEB8)](LICENSE)
[![Code style: Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/format.json)](https://github.com/astral-sh/ruff)

Powered by [DKCutter](https://github.com/ncontiero/dkcutter), DKCutter Django is a framework for jumpstarting production-ready Django projects quickly.

- If you have problems with DKCutter Django, please open [issues](https://github.com/ncontiero/dkcutter-django/issues/new).

## Usage

To scaffold an application using [dkcutter](https://github.com/ncontiero/dkcutter), run any of the following four commands and answer the command prompt questions:

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

You'll be prompted for some values. Provide them, then a Django project will be created for you.

**Warning**: After this point, change 'Nicolas Contiero <https://github.com/ncontiero>', etc to your own information.

Answer the prompts with your own desired [options][options-url]. For example:

```bash
# output
```

Enter the project and take a look around:

```bash
cd my-awesome-project/
ls
```

## Advanced usage

If you want to start faster, you can use the following options:

| Flag                              | Description                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `--projectName <string>`          | Your project's human-readable name.                                                       |
| `--projectSlug <string>`          | Your project's slug without dashes or spaces.                                             |
| `--description <string>`          | Describes your project.                                                                   |
| `--authorName <string>`           | The author name.                                                                          |
| `--domainName <string>`           | The domain name you plan to use for your project once it goes live.                       |
| `--email <string>`                | The email address you want to identify yourself in the project.                           |
| `--postgresqlVersion <string>`    | Select a PostgreSQL version to use.                                                       |
| `--cloudProvider <string>`        | Select a cloud provider for static & media files.                                         |
| `--restFramework <string>`        | Select a REST API framework.                                                              |
| `--mailService <string>`          | Select an email service that Django-Anymail provides.                                     |
| `--frontendPipeline <string>`     | Select a pipeline to compile and optimize frontend assets (JS, CSS, …).                   |
| `--frontendPipelineLang <string>` | Select the language used by the Frontend Pipeline.                                        |
| `--additionalTools <string>`      | Select additional tools to use.                                                           |
| `--automatedDepsUpdater <string>` | Choose Automated Dependency Updater. [See for more info][options-url].                    |

[See for more information about options][options-url].

### Example

The following would be the structure of an application with Sentry:

```bash
pnpm dlx dkcutter gh:ncontiero/dkcutter-django --additionalTools sentry
```

If you want to use all the default values with the exception of one or more, you can do it as follows:

```bash
pnpm dlx dkcutter gh:ncontiero/dkcutter-django --additionalTools celery,sentry -y
```

This will use the default values except for `--additionalTools`.

## For local development, see the following

- [Developing locally using docker](./docs/developing-locally-docker.md)

[options-url]: ./docs/project-generation-options.md

## References and inspirations

- [Cookiecutter Django](https://github.com/cookiecutter/cookiecutter-django) - A framework for jumpstarting production-ready Django projects quickly.

## License

This project is licensed under the **MIT** License - see the [LICENSE](./LICENSE) file for details
