export type LedgerKind = "spend" | "save";
export type AlertKind = "spend_threshold" | "savings_reached";
export type PizzaSliceId = "spending" | "saving" | "remaining";
export type StoreSource = "d1" | "mock";

export type LedgerEntry = {
  id: string;
  yearMonth: string;
  kind: LedgerKind;
  amountCents: number;
  note: string;
  recordedAt: string;
};

export type MonthPlan = {
  yearMonth: string;
  incomeCents: number;
  spendThresholdCents: number;
  savingsTargetCents: number;
};

export type OpenAlert = {
  id: string;
  yearMonth: string;
  kind: AlertKind;
  status: "open";
  triggeredAt: string;
};

export type AcknowledgedAlert = {
  id: string;
  yearMonth: string;
  kind: AlertKind;
  status: "acknowledged";
  triggeredAt: string;
  acknowledgedAt: string;
};

export type BudgetAlert = OpenAlert | AcknowledgedAlert;

export type PizzaSlice = {
  id: PizzaSliceId;
  cents: number;
};

export type MonthSnapshot = {
  yearMonth: string;
  plan: MonthPlan | null;
  spendingCents: number;
  savingCents: number;
  remainingCents: number;
  slices: PizzaSlice[];
  alerts: BudgetAlert[];
  entries: LedgerEntry[];
  source: StoreSource;
};

export type LedgerStore = {
  getMonth(yearMonth: string): Promise<MonthSnapshot>;
  setPlan(plan: MonthPlan): Promise<MonthSnapshot>;
  addEntry(
    input: Omit<LedgerEntry, "id" | "recordedAt">,
  ): Promise<MonthSnapshot>;
  acknowledgeAlert(id: string): Promise<MonthSnapshot>;
  resetMonth(yearMonth: string): Promise<MonthSnapshot>;
};
