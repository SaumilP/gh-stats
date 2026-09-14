import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: process.env.CI ? "/tmp/gh-stats-playwright" : resolve("../ai_agents_tracking/gh-stats/browser"),
  reporter: "list",
  fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:3100", browserName: "chromium", launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}, trace: "retain-on-failure" },
  webServer: { command: "npm run start -- --port 3100", url: "http://127.0.0.1:3100", reuseExistingServer: !process.env.CI, timeout: 60_000, env: { GITHUB_TOKEN: "", GH_TOKEN: "", KV_REST_API_URL: "", KV_REST_API_TOKEN: "", UPSTASH_REDIS_REST_URL: "", UPSTASH_REDIS_REST_TOKEN: "" } },
});
