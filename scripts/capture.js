const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const STORE_MEDIA_DIR = "/cursor/stores/bc-2070fc35-7b02-4775-85f6-6edb2e46a93d/media/pr-dashboard";
const REPO_MEDIA_DIR = path.join(__dirname, "../docs/pr-evidence/dashboard-ui");

fs.mkdirSync(STORE_MEDIA_DIR, { recursive: true });
fs.mkdirSync(REPO_MEDIA_DIR, { recursive: true });

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`);
}

async function main() {
  const server = spawn("npm", ["run", "dev"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    detached: true,
  });

  try {
    console.log("Waiting for dev server to start on port 43127...");
    await waitForServer("http://127.0.0.1:43127/");
    console.log("Dev server is ready!");

    const browser = await chromium.launch({ channel: "chrome" });

    const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 850 } });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto("http://127.0.0.1:43127/");
    const clear = desktopPage.getByRole("button", { name: "Clear this month" }).first();
    if (await clear.count()) {
      await clear.click();
      await desktopPage.waitForTimeout(500);
    }
    await desktopPage.getByLabel("Monthly income").fill("2500");
    await desktopPage.getByLabel("Spend alert at").fill("800");
    await desktopPage.getByLabel("Savings target").fill("400");
    await desktopPage.getByRole("button", { name: "Set this month" }).click();
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.join(STORE_MEDIA_DIR, "desktop-dashboard.png") });
    await desktopPage.screenshot({ path: path.join(REPO_MEDIA_DIR, "desktop-dashboard.png") });
    console.log("Captured desktop-dashboard.png");

    // 2. Empty State
    await desktopPage.goto("http://127.0.0.1:43127/?demo=empty");
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.join(STORE_MEDIA_DIR, "empty-state.png") });
    await desktopPage.screenshot({ path: path.join(REPO_MEDIA_DIR, "empty-state.png") });
    console.log("Captured empty-state.png");

    // 3. Alerts State
    await desktopPage.goto("http://127.0.0.1:43127/");
    const clearBtn = desktopPage.getByRole("button", { name: "Clear this month" }).first();
    if (await clearBtn.count()) {
      await clearBtn.click();
      await desktopPage.waitForTimeout(500);
      await desktopPage.getByLabel("Monthly income").fill("2500");
      await desktopPage.getByLabel("Spend alert at").fill("800");
      await desktopPage.getByLabel("Savings target").fill("400");
      await desktopPage.getByRole("button", { name: "Set this month" }).click();
      await desktopPage.waitForTimeout(500);
    }

    await desktopPage.locator("#spend-form").getByLabel("Amount").fill("850");
    await desktopPage.locator("#spend-form").getByLabel("Note").fill("Groceries & rent share");
    await desktopPage.getByRole("button", { name: "Record a spend" }).click();
    await desktopPage.waitForTimeout(500);

    await desktopPage.locator("#save-form").getByLabel("Amount").fill("400");
    await desktopPage.locator("#save-form").getByLabel("Note").fill("Savings deposit");
    await desktopPage.getByRole("button", { name: "Record a save" }).click();
    await desktopPage.waitForTimeout(500);

    await desktopPage.screenshot({ path: path.join(STORE_MEDIA_DIR, "desktop-alerts.png") });
    await desktopPage.screenshot({ path: path.join(REPO_MEDIA_DIR, "desktop-alerts.png") });
    console.log("Captured desktop-alerts.png");
    await desktopContext.close();

    // 4. Mobile Dashboard
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto("http://127.0.0.1:43127/");
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: path.join(STORE_MEDIA_DIR, "mobile-dashboard.png") });
    await mobilePage.screenshot({ path: path.join(REPO_MEDIA_DIR, "mobile-dashboard.png") });
    console.log("Captured mobile-dashboard.png");
    await mobileContext.close();

    await browser.close();
    console.log("All screenshots captured successfully!");
  } finally {
    process.kill(-server.pid);
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
