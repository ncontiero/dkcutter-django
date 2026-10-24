# AGENTS.md

Guidance for AI agents operating on `dkcutter-django`.

## Repository Architecture

This repository is a project generator template for [DKCutter](https://github.com/ncontiero/dkcutter). It operates across two distinct layers:

1. **Generator Layer (Root)**: Node/TypeScript tooling managed with Bun (`package.json`, `dkcutter.json`, `hooks/`, `tests/`).
2. **Template Layer (`template/{{dkcutter.projectSlug}}/`)**: Jinja2-templated Django project scaffold supporting Python 3.14, Django 6, uv, PostgreSQL, Docker, and frontend bundlers (Rspack / Webpack / React Email).

---

## Core Verification Commands

Always run targeted checks before considering a task complete:

```bash
# Typecheck and lint generator codebase
bun run check

# Run template generation test matrix (Vitest)
bun run test

# Run matrix tests with full TypeScript typechecking of generated outputs
RUN_TYPE_CHECK=true bun run test

# Run strict ESLint checks on generated templates
GET_WARNINGS=true bun run test

# Python formatting/linting (root & template)
uv run ruff check .
uv run djlint template/
```

Docker integration tests (requires Docker daemon):

```bash
sh tests/test_docker.sh [options]
# Example: sh tests/test_docker.sh --frontendPipeline Rspack --additionalTools tailwindcss,eslint
```

---

## Template Layer Conventions (`template/`)

- **Jinja vs Django Escaping**: DKCutter processes template files using Jinja2. Any Django template tag meant for the final generated application must be wrapped in `{% raw %}{% ... %}{% endraw %}` if it risks evaluation during generation.
- **Variable Namespacing**: Context variables injected by DKCutter must be accessed via `dkcutter.<variable>` (e.g., `{{ dkcutter.projectSlug }}`, `{{ dkcutter.useCelery }}`).
- **Context Augmentation in `hooks/preGenProject.ts`**: Helper booleans (e.g., `dkcutter.useTailwind`, `dkcutter.useWhitenoise`) are computed and injected into the context via Jinja comments at the top of `hooks/preGenProject.ts`.
- **File Pruning in `hooks/postGenProject.ts`**: Unselected features (e.g., unused REST frameworks, email configs, unselected frontend pipelines) are pruned post-generation by deleting unneeded directories and files.

---

## Option Modification Checklist (Chain of Custody)

When adding or modifying an option in `dkcutter.json`, update all corresponding locations to maintain schema and test alignment:

1. `dkcutter.json`: Define schema, prompt message, choices, default value, and validation rules.
2. `hooks/preGenProject.ts`: Map Jinja context variables and update the Zod validation schema (`validateProject`).
3. `hooks/utils/types.ts`: Update TypeScript types and interfaces (`Context`, union types).
4. `hooks/postGenProject.ts`: Implement cleanup/removal logic for unused files, dependencies, or scripts.
5. `tests/constants.ts`: Update `SUPPORTED_COMBINATIONS` or `UNSUPPORTED_COMBINATIONS` test matrices to reflect the change.
6. `docs/project-generation-options.md`: Document the new/updated option, flags, and accepted values.

---

## Frontend Pipeline & Asset Resolution

- **Bundlers**: Supports `Rspack` and `Webpack` with JavaScript (`js`) or TypeScript (`ts`).
- **Config Shared Storage**: Production configuration files (`prod.config.js`, `prod.config.ts`) live under `template/{{dkcutter.projectSlug}}/webpack/` in the template. When Rspack is chosen, `hooks/postGenProject.ts` renames and moves them to `rspack/`.
- **Asset Loading Pattern**:
  - Bundler `output.publicPath` is set to `"auto"`.
  - Django `settings/base.py` sets `"BUNDLE_DIR_NAME": "bundles/"` under `WEBPACK_LOADER`.
  - Django resolves asset URLs via `staticfiles_storage` (`static()`), while Webpack/Rspack calculates runtime chunk URLs dynamically via `document.currentScript`.
  - Do not bake cloud bucket names or CDN domains into Webpack/Rspack build args or Dockerfiles.
