import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // Use the shared package's source directly so backend tests don't
      // depend on shared having been built first.
      "@sharons-kitchen/shared": path.resolve(__dirname, "../shared/src/index.ts"),
    },
  },
});
