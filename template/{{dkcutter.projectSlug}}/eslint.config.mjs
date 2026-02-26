import { ncontiero } from "@ncontiero/eslint-config";

export default ncontiero(
  {
    ignores: ["{{ dkcutter.projectSlug }}/templates/emails/**/*.html"],
    {%- if dkcutter.useTailwind %}
    tailwindcss: {
      cssGlobalPath: "./{{ dkcutter.projectSlug }}/src/index.css",
    },
    {%- else %}
    tailwindcss: false,
    {%- endif %}
    javascript: {
      overrides: {
        "node/no-unsupported-features/node-builtins": [
          "error",
          { allowExperimental: true },
        ],
      },
    },
  },
  {
    files: ["emails/**"],
    rules: {
      "import/no-default-export": "off",
      {%- if dkcutter.useTailwind %}
      "tailwindcss/enforce-consistent-line-wrapping": "off",
      {%- endif %}
    },
  },
  {
    files: ["**/templates/**/*.html"],
    rules: {
      "html/indent": "off",
    },
  },
);
