import { defineConfig } from "vite";

const pages = ["index", "about", "skills", "experience", "credentials", "resume", "contact"];

export default defineConfig({
  base: "./",
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page, `${page}.html`]))
    }
  }
});
