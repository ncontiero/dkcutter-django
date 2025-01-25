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
  toml: {
    overrides: { "toml/indent": ["error", 4] },
  },
});
