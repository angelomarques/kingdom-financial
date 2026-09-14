import { test, expect } from "@playwright/test";
import path from "node:path";

const STORE_MEDIA_DIR = "/cursor/stores/bc-2070fc35-7b02-4775-85f6-6edb2e46a93d/media/pr-auth";
const REPO_MEDIA_DIR = path.join(process.cwd(), "docs/pr-evidence/auth");

test.describe("Capture Auth & Session Screenshots", () => {
  test("capture sign-in, sign-up, and active session screens", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Screenshots captured in desktop mode");
    // 1. Sign In Page
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: "Sign in to Kingdom Financial", level: 2 })).toBeVisible();
    await page.screenshot({ path: path.join(STORE_MEDIA_DIR, "sign-in.png"), fullPage: true });
    await page.screenshot({ path: path.join(REPO_MEDIA_DIR, "sign-in.png"), fullPage: true });

    // 2. Sign Up Page
    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { name: "Create an account", level: 2 })).toBeVisible();
    await page.screenshot({ path: path.join(STORE_MEDIA_DIR, "sign-up.png"), fullPage: true });
    await page.screenshot({ path: path.join(REPO_MEDIA_DIR, "sign-up.png"), fullPage: true });

    // 3. Complete Sign Up to see Active Session
    const email = `angelo.evidence.${Date.now()}@example.com`;
    await page.getByLabel("Full Name").fill("Ângelo Emanuel Marques");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/session/, { timeout: 15_000 });
    await expect(page.locator("#session-card")).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: path.join(STORE_MEDIA_DIR, "session-active.png"), fullPage: true });
    await page.screenshot({ path: path.join(REPO_MEDIA_DIR, "session-active.png"), fullPage: true });

    // 4. Home Page showing profile icon
    await page.goto("/");
    await expect(page.getByRole("link", { name: "User profile and session" })).toBeVisible();
    await page.screenshot({ path: path.join(STORE_MEDIA_DIR, "dashboard-profile-link.png"), fullPage: true });
    await page.screenshot({ path: path.join(REPO_MEDIA_DIR, "dashboard-profile-link.png"), fullPage: true });
  });
});
