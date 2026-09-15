import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const STORE_MEDIA_DIR = "/cursor/stores/bc-2070fc35-7b02-4775-85f6-6edb2e46a93d/media/pr-auth";
const REPO_MEDIA_DIR = path.join(process.cwd(), "docs/pr-evidence/auth");

function screenshotTargets(filename: string): string[] {
  const targets = [path.join(REPO_MEDIA_DIR, filename)];
  if (fs.existsSync(path.dirname(STORE_MEDIA_DIR))) {
    fs.mkdirSync(STORE_MEDIA_DIR, { recursive: true });
    targets.push(path.join(STORE_MEDIA_DIR, filename));
  }
  return targets;
}

async function capture(page: import("@playwright/test").Page, filename: string) {
  for (const target of screenshotTargets(filename)) {
    await page.screenshot({ path: target, fullPage: true });
  }
}

test.describe("Capture Auth & Session Screenshots", () => {
  test("capture sign-in, sign-up, and active session screens", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Screenshots captured in desktop mode");
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: "Sign in to Kingdom Financial" })).toBeVisible();
    await capture(page, "sign-in.png");

    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();
    await capture(page, "sign-up.png");

    const email = `angelo.evidence.${Date.now()}@example.com`;
    await page.getByLabel("Full Name").fill("Test User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/session/, { timeout: 15_000 });
    await expect(page.locator("#session-card")).toBeVisible({ timeout: 10_000 });
    await capture(page, "session-active.png");

    await page.goto("/");
    await expect(page.getByRole("link", { name: "User profile and session" })).toBeVisible();
    await capture(page, "dashboard-profile-link.png");
  });
});
