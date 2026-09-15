import { expect, test, type Page } from "@playwright/test";

test("home pizza shows spending, saving, and remaining", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Kingdom Financial" })).toBeVisible();
  const emptyPlan = page.getByText(/No plan for/);
  if (await emptyPlan.count()) {
    await page.getByLabel("Monthly income").fill("2500");
    await page.getByLabel("Spend alert at").fill("850");
    await page.getByLabel("Savings target").fill("400");
    await page.getByRole("button", { name: "Set this month" }).click();
  }
  await expect(page.getByRole("img", { name: /Monthly budget pizza/ })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Spending", { exact: true })).toBeVisible();
  await expect(page.getByText("Saving", { exact: true })).toBeVisible();
  await expect(page.getByText("Remaining", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Local mock|Cloudflare D1/)).toBeVisible();
  await expect(page.getByText("PostHog off")).toBeVisible();
  await expect(page.getByText("Recent Updates")).toBeVisible();
});

test("desktop layout renders 3 columns with menu bar and updates column", async ({
  page,
}) => {
  test.skip(test.info().project.name === "mobile", "Desktop-only layout test.");
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.getByText("Menu Bar")).toBeVisible();
  await expect(page.getByText("Overview")).toBeVisible();
  await expect(page.getByText("Recent Updates")).toBeVisible();
  await expect(page.getByRole("img", { name: /Monthly budget pizza/ })).toBeVisible();
});

test("mobile layout displays hamburger menu and mobile feed", async ({ page }) => {
  test.skip(test.info().project.name === "desktop", "Mobile-only layout test.");
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Monthly budget pizza/ })).toBeVisible();
  await expect(page.getByText("Recent Updates")).toBeVisible();
});

test("empty demo asks for a month plan", async ({ page }) => {
  await page.goto("/?demo=empty");
  await expect(page.getByText(/No plan for/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Set this month" })).toBeVisible();
});

test("loading demo shows skeletons instead of the pizza", async ({ page }) => {
  await page.goto("/?demo=loading");
  await expect(page.getByRole("img", { name: /Monthly budget pizza/ })).toHaveCount(0);
  await expect(page.locator("[data-slot=skeleton]").first()).toBeVisible();
});

test("error demo shows the error card and retry", async ({ page }) => {
  await page.goto("/?demo=error");
  await expect(page.getByText("The month failed to load")).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("crossing the spend cap and savings target opens alerts", async ({
  page,
}) => {
  test.setTimeout(60_000);
  test.skip(test.info().project.name === "mobile", "Serial ledger writes stay on desktop.");
  await page.goto("/");
  await resetMonth(page);
  await page.getByLabel("Monthly income").fill("1000");
  await page.getByLabel("Spend alert at").fill("50");
  await page.getByLabel("Savings target").fill("40");
  await page.getByRole("button", { name: "Set this month" }).click();
  await expect(page.getByRole("img", { name: /Monthly budget pizza/ })).toBeVisible({ timeout: 15_000 });

  await page.locator("#spend-form").getByLabel("Amount").fill("50");
  await page.locator("#spend-form").getByLabel("Note").fill("Train");
  await page.getByRole("button", { name: "Record a spend" }).click();
  await expect(page.getByText("Spend threshold hit").first()).toBeVisible({ timeout: 15_000 });

  await page.locator("#save-form").getByLabel("Amount").fill("40");
  await page.locator("#save-form").getByLabel("Note").fill("Buffer");
  await page.getByRole("button", { name: "Record a save" }).click();
  await expect(page.getByText("Savings target reached").first()).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Acknowledge" }).first().click();
  await expect(page.getByText("Marked as seen.").first()).toBeVisible({ timeout: 15_000 });
});

test("manifest is installable", async ({ page, request }) => {
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBeTruthy();
  const body = await manifest.json();
  expect(body.name).toBe("Kingdom Financial");
  expect(body.display).toBe("standalone");
  expect(body.icons.length).toBeGreaterThan(0);

  await page.goto("/");
  const registered = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active);
  });
  expect(registered).toBeTruthy();
});

async function resetMonth(page: Page) {
  const clear = page.getByRole("button", { name: "Clear this month" }).first();
  if (await clear.count()) {
    await clear.click();
    await expect(page.getByText(/No plan for/)).toBeVisible({ timeout: 10_000 });
  }
}
