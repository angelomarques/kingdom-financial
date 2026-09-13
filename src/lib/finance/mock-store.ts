import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  acknowledgeAlertInList,
  buildSnapshot,
  currentYearMonth,
} from "./month";
import type {
  BudgetAlert,
  LedgerEntry,
  LedgerStore,
  MonthPlan,
  MonthSnapshot,
} from "./types";

type MockFile = {
  plans: MonthPlan[];
  entries: LedgerEntry[];
  alerts: BudgetAlert[];
};

const DATA_PATH = process.env.VERCEL
  ? path.join("/tmp", "kingdom-financial-ledger.json")
  : path.join(process.cwd(), ".data/ledger.json");

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(work: () => Promise<T>): Promise<T> {
  const run = queue.then(work, work);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function createMockStore(): LedgerStore {
  return {
    getMonth(yearMonth) {
      return withLock(async () => {
        const file = await loadFile();
        const before = file.alerts.length;
        const snapshot = snapshotOf(file, yearMonth, true);
        if (file.alerts.length !== before) {
          await saveFile(file);
        }
        return snapshot;
      });
    },
    setPlan(plan) {
      return withLock(async () => {
        const file = await loadFile();
        file.plans = [
          ...file.plans.filter((item) => item.yearMonth !== plan.yearMonth),
          plan,
        ];
        const snapshot = snapshotOf(file, plan.yearMonth, true);
        await saveFile(file);
        return snapshot;
      });
    },
    addEntry(input) {
      return withLock(async () => {
        const file = await loadFile();
        file.entries.push({
          ...input,
          id: crypto.randomUUID(),
          recordedAt: new Date().toISOString(),
        });
        const snapshot = snapshotOf(file, input.yearMonth, true);
        await saveFile(file);
        return snapshot;
      });
    },
    acknowledgeAlert(id) {
      return withLock(async () => {
        const file = await loadFile();
        const match = file.alerts.find((alert) => alert.id === id);
        if (!match) {
          throw new Error("That alert is gone.");
        }
        file.alerts = acknowledgeAlertInList(
          file.alerts,
          id,
          new Date().toISOString(),
        );
        const snapshot = snapshotOf(file, match.yearMonth, false);
        await saveFile(file);
        return snapshot;
      });
    },
    resetMonth(yearMonth) {
      return withLock(async () => {
        const file = await loadFile();
        file.plans = file.plans.filter((plan) => plan.yearMonth !== yearMonth);
        file.entries = file.entries.filter(
          (entry) => entry.yearMonth !== yearMonth,
        );
        file.alerts = file.alerts.filter(
          (alert) => alert.yearMonth !== yearMonth,
        );
        const snapshot = snapshotOf(file, yearMonth, false);
        await saveFile(file);
        return snapshot;
      });
    },
  };
}

async function loadFile(): Promise<MockFile> {
  try {
    const raw = await readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as MockFile;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
    const seeded = seedFile();
    await saveFile(seeded);
    return seeded;
  }
}

async function saveFile(file: MockFile): Promise<void> {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(file, null, 2));
}

function snapshotOf(
  file: MockFile,
  yearMonth: string,
  persistNewAlerts: boolean,
): MonthSnapshot {
  const { snapshot, alerts } = buildSnapshot({
    yearMonth,
    plan: file.plans.find((plan) => plan.yearMonth === yearMonth) ?? null,
    entries: file.entries.filter((entry) => entry.yearMonth === yearMonth),
    alerts: file.alerts.filter((alert) => alert.yearMonth === yearMonth),
    source: "mock",
    now: new Date().toISOString(),
    nextId: () => crypto.randomUUID(),
  });

  if (persistNewAlerts) {
    const others = file.alerts.filter((alert) => alert.yearMonth !== yearMonth);
    file.alerts = [...others, ...alerts];
  }

  return snapshot;
}

function seedFile(): MockFile {
  const yearMonth = currentYearMonth();
  return {
    plans: [
      {
        yearMonth,
        incomeCents: 250_000,
        spendThresholdCents: 80_000,
        savingsTargetCents: 40_000,
      },
    ],
    entries: [
      {
        id: "seed-rent",
        yearMonth,
        kind: "spend",
        amountCents: 42_000,
        note: "Rent share",
        recordedAt: `${yearMonth}-03T09:00:00.000Z`,
      },
      {
        id: "seed-groceries",
        yearMonth,
        kind: "spend",
        amountCents: 18_750,
        note: "Groceries",
        recordedAt: `${yearMonth}-08T18:20:00.000Z`,
      },
      {
        id: "seed-save",
        yearMonth,
        kind: "save",
        amountCents: 25_000,
        note: "Emergency fund",
        recordedAt: `${yearMonth}-05T12:00:00.000Z`,
      },
    ],
    alerts: [],
  };
}
