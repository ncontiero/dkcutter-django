import { ncontiero } from "@ncontiero/eslint-config";

const TEMPLATE_GLOB = "template/**/";
const FILES_TO_IGNORE = [
  // Parser error
  "dependabot.yml",
  "ci.yml",
  "traefik.yml",
  "docker-compose.local.yml",
  "docker-compose.production.yml",
  "pyproject.toml",
  "postcss.config.mjs",
  "prod.config.mjs",
  "prod.config.ts",
  "{{dkcutter.projectSlug}}/**/*.html",
  "{{dkcutter.projectSlug}}/src/index.css",
];

function ignoreFiles(files) {
  return files.map((file) => `${TEMPLATE_GLOB}${file}`);
}

export default ncontiero(
  {
    ignores: [".venv", "venv", ...(ignoreFiles(FILES_TO_IGNORE) || [])],
  },
  {
    files: ["**/emails/**/*.tsx"],
    rules: {
      "import/no-default-export": "off",
    },
  },
);
