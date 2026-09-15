import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { toAuthState, type AuthState } from "@/lib/auth/domain";

/**
 * Server-side session loader.
 * Loads the active session from incoming cookies/headers directly on the server.
 */
export async function getSession(): Promise<AuthState> {
  try {
    const headerList = await headers();
    const sessionData = await auth.api.getSession({
      headers: headerList,
    });
    return toAuthState(sessionData);
  } catch (error) {
    console.error("Failed to load session:", error);
    return {
      status: "unauthenticated",
      user: null,
      session: null,
    };
  }
}
