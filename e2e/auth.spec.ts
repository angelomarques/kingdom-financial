import { expect, test } from "@playwright/test";

test.describe("Authentication and Session Flow", () => {
  const uniqueId = Date.now();
  const testUser = {
    name: "Angelo Marques",
    email: `angelo.test.${uniqueId}@example.com`,
    password: "Password123!",
  };

  test("unauthenticated visit to /session redirects to /sign-in via middleware", async ({
    page,
  }) => {
    await page.goto("/session");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole("heading", { name: "Sign in to Kingdom Financial" })).toBeVisible();
  });

  test("can sign in and sign out lifecycle", async ({ page }) => {
    // 1. Sign up
    await page.goto("/sign-up");
    await page.getByLabel("Full Name").fill(testUser.name);
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);
    await page.getByRole("button", { name: "Create account" }).click();

    // After sign up, redirects to /session (allow time for D1 HTTP query)
    await expect(page).toHaveURL(/\/session/, { timeout: 15_000 });
    await expect(page.locator("#session-card")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(testUser.name)).toBeVisible();

    // 2. Sign out
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 });

    // 3. Sign in again with same credentials
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/session/, { timeout: 15_000 });
    await expect(page.getByText(testUser.name)).toBeVisible();
  });

  test("home page contains link to session page", async ({ page }) => {
    await page.goto("/");
    const profileLink = page.getByRole("link", { name: "User profile and session" });
    await expect(profileLink).toBeVisible();
    await profileLink.click({ force: true });
    await expect(page).toHaveURL(/\/(session|sign-in)/);
  });
});
