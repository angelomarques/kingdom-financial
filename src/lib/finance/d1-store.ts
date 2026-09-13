import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildSnapshot } from "./month";
import type {
  BudgetAlert,
  LedgerEntry,
  LedgerStore,
  MonthPlan,
  MonthSnapshot,
} from "./types";

type D1QueryResponse = {
  success: boolean;
  errors?: { message: string }[];
  result?: { results?: Record<string, unknown>[] }[];
};

type D1Config = {
  accountId: string;
  apiToken: string;
  databaseId: string;
};

export function d1ConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): D1Config | null {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = env.CLOUDFLARE_API_TOKEN?.trim();
  const databaseId = env.CLOUDFLARE_D1_DATABASE_ID?.trim();
  if (!accountId || !apiToken || !databaseId) {
    return null;
  }
  return { accountId, apiToken, databaseId };
}

export function createD1Store(config: D1Config): LedgerStore {
  let schemaReady: Promise<void> | null = null;

  async function ensureSchema() {
    if (!schemaReady) {
      schemaReady = applySchema(config);
    }
    await schemaReady;
  }

  return {
    async getMonth(yearMonth) {
      await ensureSchema();
      return persistRefreshedAlerts(config, yearMonth);
    },
    async setPlan(plan) {
      await ensureSchema();
      await query(config, {
        sql: `INSERT INTO month_plans (year_month, income_cents, spend_threshold_cents, savings_target_cents)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(year_month) DO UPDATE SET
                income_cents = excluded.income_cents,
                spend_threshold_cents = excluded.spend_threshold_cents,
                savings_target_cents = excluded.savings_target_cents`,
        params: [
          plan.yearMonth,
          plan.incomeCents,
          plan.spendThresholdCents,
          plan.savingsTargetCents,
        ],
      });
      return persistRefreshedAlerts(config, plan.yearMonth);
    },
    async addEntry(input) {
      await ensureSchema();
      const now = new Date().toISOString();
      await query(config, {
        sql: `INSERT INTO ledger_entries (id, year_month, kind, amount_cents, note, recorded_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        params: [
          crypto.randomUUID(),
          input.yearMonth,
          input.kind,
          input.amountCents,
          input.note,
          now,
        ],
      });
      return persistRefreshedAlerts(config, input.yearMonth);
    },
    async acknowledgeAlert(id) {
      await ensureSchema();
      const now = new Date().toISOString();
      const rows = await query(config, {
        sql: `SELECT year_month FROM budget_alerts WHERE id = ?`,
        params: [id],
      });
      const yearMonth = String(rows[0]?.year_month ?? "");
      if (!yearMonth) {
        throw new Error("That alert is gone.");
      }
      await query(config, {
        sql: `UPDATE budget_alerts
              SET status = 'acknowledged', acknowledged_at = ?
              WHERE id = ? AND status = 'open'`,
        params: [now, id],
      });
      return loadSnapshot(config, yearMonth);
    },
    async resetMonth(yearMonth) {
      await ensureSchema();
      await query(config, {
        sql: `DELETE FROM ledger_entries WHERE year_month = ?`,
        params: [yearMonth],
      });
      await query(config, {
        sql: `DELETE FROM budget_alerts WHERE year_month = ?`,
        params: [yearMonth],
      });
      await query(config, {
        sql: `DELETE FROM month_plans WHERE year_month = ?`,
        params: [yearMonth],
      });
      return loadSnapshot(config, yearMonth);
    },
  };
}

async function applySchema(config: D1Config): Promise<void> {
  const sql = await readFile(
    path.join(process.cwd(), "src/lib/finance/schema.sql"),
    "utf8",
  );
  const statements = sql
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await query(config, { sql: statement });
  }
}

async function persistRefreshedAlerts(
  config: D1Config,
  yearMonth: string,
): Promise<MonthSnapshot> {
  const current = await loadSnapshot(config, yearMonth);
  for (const alert of current.alerts) {
    await query(config, {
      sql: `INSERT INTO budget_alerts (id, year_month, kind, status, triggered_at, acknowledged_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              status = excluded.status,
              acknowledged_at = excluded.acknowledged_at`,
      params: [
        alert.id,
        alert.yearMonth,
        alert.kind,
        alert.status,
        alert.triggeredAt,
        alert.status === "acknowledged" ? alert.acknowledgedAt : null,
      ],
    });
  }
  return loadSnapshot(config, yearMonth);
}

async function loadSnapshot(
  config: D1Config,
  yearMonth: string,
): Promise<MonthSnapshot> {
  const planRows = await query(config, {
    sql: `SELECT year_month, income_cents, spend_threshold_cents, savings_target_cents
          FROM month_plans WHERE year_month = ?`,
    params: [yearMonth],
  });
  const entryRows = await query(config, {
    sql: `SELECT id, year_month, kind, amount_cents, note, recorded_at
          FROM ledger_entries WHERE year_month = ?`,
    params: [yearMonth],
  });
  const alertRows = await query(config, {
    sql: `SELECT id, year_month, kind, status, triggered_at, acknowledged_at
          FROM budget_alerts WHERE year_month = ?`,
    params: [yearMonth],
  });

  const { snapshot, alerts } = buildSnapshot({
    yearMonth,
    plan: planRows[0] ? parsePlan(planRows[0]) : null,
    entries: entryRows.map(parseEntry),
    alerts: alertRows.map(parseAlert),
    source: "d1",
    now: new Date().toISOString(),
    nextId: () => crypto.randomUUID(),
  });

  if (alerts.length !== alertRows.length) {
    return snapshot;
  }

  return snapshot;
}

async function query(
  config: D1Config,
  body: { sql: string; params?: unknown[] },
): Promise<Record<string, unknown>[]> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const payload = (await response.json()) as D1QueryResponse;
  if (!response.ok || !payload.success) {
    const detail = payload.errors?.[0]?.message ?? `HTTP ${response.status}`;
    throw new Error(`D1 query failed: ${detail}`);
  }

  return payload.result?.[0]?.results ?? [];
}

function parsePlan(row: Record<string, unknown>): MonthPlan {
  return {
    yearMonth: String(row.year_month),
    incomeCents: Number(row.income_cents),
    spendThresholdCents: Number(row.spend_threshold_cents),
    savingsTargetCents: Number(row.savings_target_cents),
  };
}

function parseEntry(row: Record<string, unknown>): LedgerEntry {
  const kind = row.kind;
  if (kind !== "spend" && kind !== "save") {
    throw new Error("D1 returned an unknown ledger kind.");
  }
  return {
    id: String(row.id),
    yearMonth: String(row.year_month),
    kind,
    amountCents: Number(row.amount_cents),
    note: String(row.note),
    recordedAt: String(row.recorded_at),
  };
}

function parseAlert(row: Record<string, unknown>): BudgetAlert {
  const kind = row.kind;
  const status = row.status;
  if (kind !== "spend_threshold" && kind !== "savings_reached") {
    throw new Error("D1 returned an unknown alert kind.");
  }
  if (status === "acknowledged") {
    return {
      id: String(row.id),
      yearMonth: String(row.year_month),
      kind,
      status,
      triggeredAt: String(row.triggered_at),
      acknowledgedAt: String(row.acknowledged_at ?? row.triggered_at),
    };
  }
  if (status !== "open") {
    throw new Error("D1 returned an unknown alert status.");
  }
  return {
    id: String(row.id),
    yearMonth: String(row.year_month),
    kind,
    status,
    triggeredAt: String(row.triggered_at),
  };
}
