import { defineConfig } from "vite";

const pages = ["index", "about", "credentials", "resume", "contact"];

export default defineConfig({
  base: "./",
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page, `${page}.html`]))
    }
  }
});
