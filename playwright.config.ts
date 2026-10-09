import { defineConfig, devices } from "@playwright/test";
import { config } from "./fixtures/config";

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // Sitio público y compartido: ejecución secuencial para evitar inestabilidad
  fullyParallel: false,
  workers: 1,
  retries: 0,

  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: config.baseUrl,
    // Evidencia exigida por la prueba
    screenshot: "on",
    video: "on",
    trace: "on",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
