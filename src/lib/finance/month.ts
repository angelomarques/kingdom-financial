import type {
  AlertKind,
  BudgetAlert,
  LedgerEntry,
  LedgerKind,
  MonthPlan,
  MonthSnapshot,
  PizzaSlice,
  StoreSource,
} from "./types";

const YEAR_MONTH = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Lisbon",
  year: "numeric",
  month: "2-digit",
});

export function currentYearMonth(now = new Date()): string {
  const parts = YEAR_MONTH.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  if (!year || !month) {
    throw new Error("Could not format the current month.");
  }
  return `${year}-${month}`;
}

export function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Lisbon",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function sumByKind(entries: LedgerEntry[], kind: LedgerKind): number {
  return entries.reduce(
    (total, entry) => (entry.kind === kind ? total + entry.amountCents : total),
    0,
  );
}

export function buildSlices(
  incomeCents: number,
  spendingCents: number,
  savingCents: number,
): PizzaSlice[] {
  return [
    { id: "spending", cents: spendingCents },
    { id: "saving", cents: savingCents },
    {
      id: "remaining",
      cents: Math.max(0, incomeCents - spendingCents - savingCents),
    },
  ];
}

export function refreshAlerts(
  plan: MonthPlan | null,
  spendingCents: number,
  savingCents: number,
  existing: BudgetAlert[],
  now: string,
  nextId: () => string,
): BudgetAlert[] {
  const next = [...existing];

  maybeOpenAlert(
    next,
    plan,
    "spend_threshold",
    Boolean(plan && plan.spendThresholdCents > 0 && spendingCents >= plan.spendThresholdCents),
    now,
    nextId,
  );
  maybeOpenAlert(
    next,
    plan,
    "savings_reached",
    Boolean(plan && plan.savingsTargetCents > 0 && savingCents >= plan.savingsTargetCents),
    now,
    nextId,
  );

  return next;
}

function maybeOpenAlert(
  alerts: BudgetAlert[],
  plan: MonthPlan | null,
  kind: AlertKind,
  shouldOpen: boolean,
  now: string,
  nextId: () => string,
): void {
  if (!plan || !shouldOpen || alerts.some((alert) => alert.kind === kind)) {
    return;
  }

  alerts.push({
    id: nextId(),
    yearMonth: plan.yearMonth,
    kind,
    status: "open",
    triggeredAt: now,
  });
}

export function acknowledgeAlertInList(
  alerts: BudgetAlert[],
  id: string,
  now: string,
): BudgetAlert[] {
  return alerts.map((alert) => {
    if (alert.id !== id || alert.status === "acknowledged") {
      return alert;
    }
    return {
      ...alert,
      status: "acknowledged",
      acknowledgedAt: now,
    };
  });
}

export function buildSnapshot(input: {
  yearMonth: string;
  plan: MonthPlan | null;
  entries: LedgerEntry[];
  alerts: BudgetAlert[];
  source: StoreSource;
  now: string;
  nextId: () => string;
}): { snapshot: MonthSnapshot; alerts: BudgetAlert[] } {
  const spendingCents = sumByKind(input.entries, "spend");
  const savingCents = sumByKind(input.entries, "save");
  const alerts = refreshAlerts(
    input.plan,
    spendingCents,
    savingCents,
    input.alerts,
    input.now,
    input.nextId,
  );
  const slices = buildSlices(input.plan?.incomeCents ?? 0, spendingCents, savingCents);
  const remainingCents =
    slices.find((slice) => slice.id === "remaining")?.cents ?? 0;

  return {
    alerts,
    snapshot: {
      yearMonth: input.yearMonth,
      plan: input.plan,
      spendingCents,
      savingCents,
      remainingCents,
      slices,
      alerts,
      entries: [...input.entries].sort((a, b) =>
        b.recordedAt.localeCompare(a.recordedAt),
      ),
      source: input.source,
    },
  };
}
