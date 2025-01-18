/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./{{dkcutter.projectSlug}}/src/index.css",
    "./{{dkcutter.projectSlug}}/src/**/*.js",
    "./{{dkcutter.projectSlug}}/**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
