import { defineConfig, devices } from "@playwright/test";

const port = 43129;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `npm run dev -- --port ${port} --hostname 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.CI ? {} : { channel: "chrome" }),
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        ...(process.env.CI ? {} : { channel: "chrome" }),
      },
    },
  ],
});
