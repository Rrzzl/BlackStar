import { defineConfig } from "vitest/config";
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
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
