export default {
  plugins: {
    {%- if dkcutter.useTailwind %}
    "@tailwindcss/postcss": {},
    {%- else %}
    "postcss-preset-env": {},
    autoprefixer: {},
    {%- endif %}
  },
};
