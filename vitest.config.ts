import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // The RSC guard package throws outside Next; tests exercise pure logic.
      "server-only": path.resolve(__dirname, "node_modules/server-only/empty.js"),
    },
  },
});
