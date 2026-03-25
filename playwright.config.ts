import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
    launchOptions: fs.existsSync(chromePath)
      ? {
          executablePath: chromePath
        }
      : undefined
  },
  webServer: {
    command: "export PATH=\"$HOME/.local/node/current/bin:$PATH\" && npm run dev -- --hostname 127.0.0.1 --port 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: true,
    timeout: 120 * 1000
  }
});
