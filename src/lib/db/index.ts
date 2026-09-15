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

function missingD1EnvMessage(): string {
  return (
    "Missing Cloudflare D1 HTTP credentials. Set CLOUDFLARE_ACCOUNT_ID, " +
    "CLOUDFLARE_D1_DATABASE_ID, and CLOUDFLARE_D1_TOKEN (or CLOUDFLARE_API_TOKEN) " +
    "for the kingdom-financial database only (600077c8-acb0-47a1-b9c1-84e2df7dc1dd)."
  );
}

/**
 * Creates or gets the Drizzle database connected to Kingdom Financial Cloudflare D1
 * via HTTP API. Local dev/CI without credentials uses node:sqlite in-memory fallback.
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

  // node:sqlite is unavailable during Vercel builds; require D1 HTTP credentials there.
  if (process.env.VERCEL) {
    throw new Error(missingD1EnvMessage());
  }

  // Dynamic require keeps node:sqlite out of the Vercel server bundle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createLocalFallbackDb } = require("./local-fallback") as typeof import("./local-fallback");
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
