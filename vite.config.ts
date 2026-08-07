import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        display: resolve(__dirname, "display/index.html"),
        controller: resolve(__dirname, "controller/index.html"),
      },
    },
  },
  server: {
    port: 5173,
  },
});
