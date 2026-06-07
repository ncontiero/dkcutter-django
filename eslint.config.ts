import { ncontiero } from "@ncontiero/eslint-config";

const TEMPLATE_GLOB = "template/**/";
const FILES_TO_IGNORE = [
  // Parser error
  "pnpm-workspace.yaml",
  "dependabot.yml",
  "ci.yml",
  "traefik.yml",
  "docker-compose.local.yml",
  "docker-compose.production.yml",
  "pyproject.toml",
  "postcss.config.js",
  "eslint.config.js",
  "prod.config.js",
  "prod.config.ts",
  "tsconfig.json",
  "{{dkcutter.projectSlug}}/**/*.html",
  "{{dkcutter.projectSlug}}/src/index.css",
];

function ignoreFiles(files: string[]) {
  return files.map((file) => `${TEMPLATE_GLOB}${file}`);
}

export default ncontiero(
  {
    ignores: [".venv", "venv", ...(ignoreFiles(FILES_TO_IGNORE) || [])],
    javascript: {
      overrides: {
        "node/no-unsupported-features/node-builtins": [
          "error",
          { allowExperimental: true },
        ],
      },
    },
    tailwindcss: false,
  },
  {
    files: ["**/emails/**/*.tsx"],
    rules: {
      "import/no-default-export": "off",
    },
  },
);
