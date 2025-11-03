export default {
  plugins: {
    {% if "tailwindcss" in dkcutter.additionalTools %}
    "@tailwindcss/postcss": {},
    {% else %}
    "postcss-preset-env": {},
    autoprefixer: {},
    {% endif %}
  },
};
