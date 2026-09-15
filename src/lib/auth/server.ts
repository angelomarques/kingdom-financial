import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
    usePlural: false,
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "kingdom-financial-dev-auth-secret-32-chars-minimum-ok",
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.PORT
      ? `http://127.0.0.1:${process.env.PORT}`
      : "http://127.0.0.1:43129"),
  trustedOrigins: [
    "http://127.0.0.1:43129",
    "http://localhost:43129",
    "http://127.0.0.1:43127",
    "http://localhost:43127",
    "http://localhost:3000",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
      ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((s) => s.trim())
      : []),
  ],
  plugins: [nextCookies()],
});
