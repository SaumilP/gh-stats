import { test, expect } from "@playwright/test";

const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="240" viewBox="0 0 480 240"><rect width="480" height="240" rx="14" fill="#14221a"/><text x="24" y="60" fill="#b5edc9">Fixture GitHub Overview</text></svg>';

test("homepage is useful before JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create your card", exact: true })).toBeVisible();
  await context.close();
});

test("builder updates, restores links, copies the selected configuration, and recovers from errors", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.route("**/api/**", route => route.fulfill({ body: svg, contentType: "image/svg+xml", headers: { "X-Card-Status": "fresh", "X-Data-Updated-At": "2026-09-14T00:00:00Z" } }));
  await page.goto("/");
  await page.getByLabel("GitHub username", { exact: true }).fill("fixture-user");
  await page.getByRole("button", { name: "Generate my card", exact: true }).click();
  await expect(page.getByText("Your preview", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Languages", exact: true }).click();
  await page.getByLabel("Card theme", { exact: true }).selectOption("nord");
  await page.getByText("Fine-tune your card").click();
  await page.getByLabel("Chart layout").selectOption("donut");
  await expect(page.getByRole("button", { name: "Copy embed", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Copy embed", exact: true }).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("/api/languages?username=fixture-user&theme=nord&layout=donut");
  await page.reload();
  await expect(page.getByLabel("Card theme", { exact: true })).toHaveValue("nord");
  await expect(page.getByLabel("GitHub username", { exact: true })).toHaveValue("fixture-user");
  await page.getByRole("button", { name: "Adaptive", exact: true }).click();
  await expect(page.getByLabel("Embed code")).toContainText("theme=light");
  await expect(page.getByLabel("Embed code")).toContainText("theme=dark");
  await page.route("**/api/**", route => route.fulfill({ body: '<svg data-error="true"></svg>', contentType: "image/svg+xml", headers: { "X-Card-Status": "error" } }));
  await page.getByRole("button", { name: "Streak", exact: true }).click();
  await expect(page.getByText("Let’s try that again.")).toBeVisible();
  await page.route("**/api/**", route => route.fulfill({ body: svg, contentType: "image/svg+xml", headers: { "X-Card-Status": "stale" } }));
  await page.getByRole("button", { name: "Retry preview" }).click();
  await expect(page.getByText("Saved snapshot", { exact: true })).toBeVisible();
});

for (const width of [375, 768, 1440]) {
  test(`responsive layout at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.locator(".generated-card").scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator(".generated-card").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`dark-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "Toggle light and dark appearance" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await page.screenshot({ path: testInfo.outputPath(`light-${width}.png`), fullPage: true });
  });
}

test("documentation anchors and theme navigation work", async ({ page }) => {
  await page.goto("/docs#themes");
  await expect(page.getByRole("heading", { name: "Find your palette." })).toBeInViewport();
  await page.getByLabel("Search all themes").fill("nord");
  await page.locator(".theme-tile").click();
  await expect(page.getByLabel("Card theme", { exact: true })).toHaveValue("nord");
});
