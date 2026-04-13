import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@engine": resolve(__dirname, "src/engine"),
      "@core": resolve(__dirname, "src/core"),
      "@scenes": resolve(__dirname, "src/scenes"),
      "@ui": resolve(__dirname, "src/ui"),
      "@content": resolve(__dirname, "src/content"),
    },
  },
  server: { port: 5173 },
  build: { target: "es2022", sourcemap: true },
});
