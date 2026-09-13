CREATE TABLE IF NOT EXISTS month_plans (
  year_month TEXT PRIMARY KEY,
  income_cents INTEGER NOT NULL,
  spend_threshold_cents INTEGER NOT NULL,
  savings_target_cents INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  year_month TEXT NOT NULL,
  kind TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  note TEXT NOT NULL,
  recorded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS budget_alerts (
  id TEXT PRIMARY KEY,
  year_month TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  triggered_at TEXT NOT NULL,
  acknowledged_at TEXT
);
