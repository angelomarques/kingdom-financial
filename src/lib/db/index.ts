import { drizzle as drizzleProxy, type SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

export type AppDb = SqliteRemoteDatabase<typeof schema>;

type D1Config = {
  accountId: string;
  databaseId: string;
  apiToken: string;
};

export function d1ConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): D1Config | null {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const databaseId = env.CLOUDFLARE_D1_DATABASE_ID?.trim();
  const apiToken =
    env.CLOUDFLARE_D1_TOKEN?.trim() || env.CLOUDFLARE_API_TOKEN?.trim();

  if (!accountId || !databaseId || !apiToken) {
    return null;
  }
  return { accountId, databaseId, apiToken };
}

let cachedDb: AppDb | null = null;

/**
 * Creates or gets the Drizzle database connected to Kingdom Financial Cloudflare D1
 * via HTTP API (or fallback local SQLite in test/mock environment if credentials not provided).
 */
export function getDb(): AppDb {
  if (cachedDb) {
    return cachedDb;
  }

  const d1 = d1ConfigFromEnv();
  if (d1) {
    cachedDb = createD1HttpDb(d1);
    return cachedDb;
  }

  // Local fallback: in-memory / local sqlite for offline testing or without cloud credentials
  cachedDb = createLocalFallbackDb();
  return cachedDb;
}

function createD1HttpDb(config: D1Config): AppDb {
  const { accountId, databaseId, apiToken } = config;
  return drizzleProxy(
    async (sql, params, method) => {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sql, params }),
        },
      );

      const json: {
        success: boolean;
        errors?: { message: string }[];
        result?: {
          results?: Record<string, unknown>[];
          meta?: { changes?: number };
        }[];
      } = await res.json();

      if (!json.success) {
        throw new Error(
          json.errors?.map((e) => e.message).join("; ") ?? "D1 HTTP query failed",
        );
      }

      const queryResult = json.result?.[0];
      const results = queryResult?.results ?? [];
      const changes = queryResult?.meta?.changes ?? results.length;

      if (method === "run") {
        return {
          rows: [],
          changes,
          meta: { changes },
        };
      }

      // Convert object records to row value arrays for drizzle-orm sqlite-proxy
      const rows = results.map((row) => Object.values(row));
      return {
        rows,
        changes,
        meta: { changes },
      };
    },
    { schema },
  );
}

// Fallback in-memory database using node:sqlite when Cloudflare D1 credentials are not present
function createLocalFallbackDb(): AppDb {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DatabaseSync } = require("node:sqlite");
  const localDb = new DatabaseSync(":memory:");

  // Initialize schema in memory
  localDb.exec(`
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
  `);

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
