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
  "postcss.config.cjs",
  "prod.config.mjs",
  "prod.config.ts",
];

function ignoreFiles(files) {
  return files.map((file) => `${TEMPLATE_GLOB}${file}`);
}

export default ncontiero({
  ignores: [".venv", "venv", ...(ignoreFiles(FILES_TO_IGNORE) || [])],
  toml: {
    overrides: {
      "toml/indent": ["error", 4],
    },
  },
});
