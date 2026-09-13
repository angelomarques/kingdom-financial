import { expect, test } from "@playwright/test";
import { buildSlices, refreshAlerts } from "../src/lib/finance/month";
import { parseEuroToCents } from "../src/lib/finance/money";

test("pizza math splits leftover income after spend and save", () => {
  expect(buildSlices(250_000, 60_750, 25_000)).toEqual([
    { id: "spending", cents: 60_750 },
    { id: "saving", cents: 25_000 },
    { id: "remaining", cents: 164_250 },
  ]);
});

test("euro parser accepts a comma decimal", () => {
  expect(parseEuroToCents("12,50")).toBe(1250);
  expect(parseEuroToCents("2500")).toBe(250_000);
});

test("alerts open once when a threshold is crossed", () => {
  let n = 0;
  const alerts = refreshAlerts(
    {
      yearMonth: "2026-09",
      incomeCents: 100_000,
      spendThresholdCents: 5_000,
      savingsTargetCents: 4_000,
    },
    5_000,
    4_000,
    [],
    "2026-09-13T00:00:00.000Z",
    () => `alert-${++n}`,
  );

  expect(alerts).toEqual([
    {
      id: "alert-1",
      yearMonth: "2026-09",
      kind: "spend_threshold",
      status: "open",
      triggeredAt: "2026-09-13T00:00:00.000Z",
    },
    {
      id: "alert-2",
      yearMonth: "2026-09",
      kind: "savings_reached",
      status: "open",
      triggeredAt: "2026-09-13T00:00:00.000Z",
    },
  ]);
});
