import { dkshs } from "@dkshs/eslint-config";

export default dkshs({
  ignores: ["**/*.html"],
  javascript: {
    overrides: {
      "node/no-unsupported-features/node-builtins": [
        "error",
        { allowExperimental: true },
      ],
    },
  },
  unicorn: {
    overrides: { "unicorn/prefer-query-selector": "off" },
  },
  toml: {
    overrides: { "toml/indent": ["error", 4] },
  },
});
