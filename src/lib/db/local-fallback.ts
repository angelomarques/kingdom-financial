import { drizzle as drizzleProxy, type SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

export type AppDb = SqliteRemoteDatabase<typeof schema>;

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER DEFAULT 0 NOT NULL,
    image TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at INTEGER,
    refresh_token_expires_at INTEGER,
    scope TEXT,
    password TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY NOT NULL,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS month_plans (
    year_month TEXT PRIMARY KEY NOT NULL,
    income_cents INTEGER NOT NULL,
    spend_threshold_cents INTEGER NOT NULL,
    savings_target_cents INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS ledger_entries (
    id TEXT PRIMARY KEY NOT NULL,
    year_month TEXT NOT NULL,
    kind TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    note TEXT NOT NULL,
    recorded_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS budget_alerts (
    id TEXT PRIMARY KEY NOT NULL,
    year_month TEXT NOT NULL,
    kind TEXT NOT NULL,
    status TEXT NOT NULL,
    triggered_at TEXT NOT NULL,
    acknowledged_at TEXT
  );
`;

/** Local-only in-memory SQLite via node:sqlite. Never loaded on Vercel. */
export function createLocalFallbackDb(): AppDb {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DatabaseSync } = require("node:sqlite");
  const localDb = new DatabaseSync(":memory:");
  localDb.exec(INIT_SQL);

  return drizzleProxy(
    async (sql, params, method) => {
      if (method === "run") {
        const stmt = localDb.prepare(sql);
        const result = stmt.run(...params);
        return {
          rows: [],
          changes: result.changes,
          meta: { changes: result.changes },
        };
      }
      const stmt = localDb.prepare(sql);
      const results = stmt.all(...params) as Record<string, unknown>[];
      const rows = results.map((row) => Object.values(row));
      return {
        rows,
        changes: rows.length,
        meta: { changes: rows.length },
      };
    },
    { schema },
  );
}
