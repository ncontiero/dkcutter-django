# dkcutter-django

[![license mit](https://img.shields.io/badge/licence-MIT-56BEB8)](LICENSE)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/ambv/black)

A simple Django template with dkcutter.

## Usage

To scaffold an application using [dkcutter](https://github.com/dkshs/dkcutter), run any of the following four commands and answer the command prompt questions:

### npm

```bash
npx dkcutter@latest gh:dkshs/dkcutter-django
```

### yarn

```bash
yarn dlx dkcutter@latest gh:dkshs/dkcutter-django
```

### pnpm

```bash
pnpm dlx dkcutter@latest gh:dkshs/dkcutter-django
```

### bun

```bash
bunx dkcutter@latest gh:dkshs/dkcutter-django
```

You'll be prompted for some values. Provide them, then a Django project will be created for you.

**Warning**: After this point, change 'DKSHS', etc to your own information.

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

| Flag                           | Description                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `--projectName <string>`       | Your project's human-readable name.                                                       |
| `--projectSlug <string>`       | Your project's slug without dashes or spaces.                                             |
| `--description <string>`       | Describes your project                                                                    |
| `--authorName <string>`        | The author name.                                                                          |
| `--domainName <string>`        | The domain name you plan to use for your project once it goes live.                       |
| `--email <string>`             | The email address you want to identify yourself in the project.                           |
| `--postgresqlVersion <string>` | Select a PostgreSQL version to use.                                                       |
| `--cloudProvider <string>`     | Select a cloud provider for static & media files.                                         |
| `--restFramework <string>`     | Select a REST API framework.                                                              |
| `--mailService <string>`       | Select an email service that Django-Anymail provides                                      |
| `--useMailpit [boolean]`       | Include [Mailpit][mailpit-url] in the project. If `mailService` is different from `None`. |
| `--useCelery [boolean]`        | Include [Celery](https://github.com/celery/celery) in the project.                        |
| `--useSentry [boolean]`        | Include [Sentry](https://github.com/getsentry/sentry) in the project.                     |
| `--useWhitenoise [boolean]`    | Include [Whitenoise](https://github.com/evansd/whitenoise) in the project.                |
| `--usePgadmin [boolean]`       | Include [pgAdmin](https://www.pgadmin.org/) in the project.                               |
| `--useTailwindcss [boolean]`   | Include [TailwindCSS](https://tailwindcss.com/) in the project.                           |

[mailpit-url]: https://github.com/axllent/mailpit/

[See for more information about options][options-url].

### Example

The following would be the structure of an application with Sentry:

```bash
pnpm dlx dkcutter gh:dkshs/dkcutter-django --useSentry
```

If you want to use all the default values with the exception of one or more, you can do it as follows:

```bash
pnpm dlx dkcutter gh:dkshs/dkcutter-django --useCelery --useSentry -y
```

This will use the default values, with the exception of the `--useCelery` and `--useSentry` options.

## For local development, see the following

- [Developing locally using docker](./docs/developing-locally-docker.md)

[options-url]: ./docs/project-generation-options.md
