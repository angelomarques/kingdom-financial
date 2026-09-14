import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ============================================================================
// Better Auth Schema (SQLite)
// ============================================================================

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ============================================================================
// Kingdom Financial Domain Tables
// ============================================================================

export const monthPlans = sqliteTable("month_plans", {
  yearMonth: text("year_month").primaryKey(),
  incomeCents: integer("income_cents").notNull(),
  spendThresholdCents: integer("spend_threshold_cents").notNull(),
  savingsTargetCents: integer("savings_target_cents").notNull(),
});

export const ledgerEntries = sqliteTable("ledger_entries", {
  id: text("id").primaryKey(),
  yearMonth: text("year_month").notNull(),
  kind: text("kind").notNull(),
  amountCents: integer("amount_cents").notNull(),
  note: text("note").notNull(),
  recordedAt: text("recorded_at").notNull(),
});

export const budgetAlerts = sqliteTable("budget_alerts", {
  id: text("id").primaryKey(),
  yearMonth: text("year_month").notNull(),
  kind: text("kind").notNull(),
  status: text("status").notNull(),
  triggeredAt: text("triggered_at").notNull(),
  acknowledgedAt: text("acknowledged_at"),
});

export type UserTable = typeof user.$inferSelect;
export type SessionTable = typeof session.$inferSelect;
export type AccountTable = typeof account.$inferSelect;
export type VerificationTable = typeof verification.$inferSelect;
