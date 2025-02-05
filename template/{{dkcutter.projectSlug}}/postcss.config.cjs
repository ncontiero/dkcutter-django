/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: ["postcss-preset-env", "autoprefixer"{% if "tailwindcss" in dkcutter.additionalTools %}, "tailwindcss"{% endif %}],
};

module.exports = config;
