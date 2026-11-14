import { defineConfig, devices } from "@playwright/test";

// The real API and admin frontend must already be running; never start a
// service pointed at an unknown database just for these tests.
export default defineConfig({
  testDir: "./tests/live",
  retries: 0,
  workers: 1,
  reporter: "list",
  // Authenticated runs use real credentials and tokens. Do not persist traces.
  use: { baseURL: process.env.LIVE_ADMIN_URL ?? "http://localhost:3001", trace: "off", screenshot: "off", video: "off" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
