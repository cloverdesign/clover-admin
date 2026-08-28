import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  // Resolves the `@/…` aliases from tsconfig, so tests import exactly like the app.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["{app,components,lib,hooks}/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
})
