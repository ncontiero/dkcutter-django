import { initThemeToggle } from "./theme-toggle.js";

const initializeApp = () => {
  setTimeout(() => {
    document.documentElement.classList.replace("opacity-0", "opacity-100");
  }, 500);

  initThemeToggle();
};

document.addEventListener("DOMContentLoaded", initializeApp);

/* Project specific Javascript goes here. */
