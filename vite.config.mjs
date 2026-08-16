import { defineConfig } from "vite";

const pages = ["index", "about", "skills", "experience", "projects", "credentials", "resume", "contact"];

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page, `${page}.html`]))
    }
  }
});
