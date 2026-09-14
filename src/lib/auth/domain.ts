/**
 * Domain types for Kingdom Financial Authentication & Sessions.
 *
 * Modeled per pstack principle-model-the-domain:
 * - Named domain types for User and Session
 * - Discriminated union for AuthState (unauthenticated vs authenticated)
 * - Discriminated union for AuthActionResult (idle, error, success)
 * - Invalid states (e.g. authenticated without user/session, or unauthenticated with user)
 *   are unrepresentable by construction.
 */

export type UserId = string;
export type SessionId = string;

export type User = {
  id: UserId;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  id: SessionId;
  userId: UserId;
  token: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthenticatedSession = {
  status: "authenticated";
  user: User;
  session: Session;
};

export type UnauthenticatedSession = {
  status: "unauthenticated";
  user: null;
  session: null;
};

/**
 * Discriminated union representing the complete user authentication state.
 * Eliminates scattered null checks and boolean flags (isLoggedIn, hasUser, etc.).
 */
export type AuthState = AuthenticatedSession | UnauthenticatedSession;

export type AuthActionResult =
  | { status: "idle" }
  | { status: "success"; message?: string; redirectUrl?: string }
  | { status: "error"; message: string };

export const idleAuthActionResult: AuthActionResult = { status: "idle" };

/**
 * Domain helper to transform Better Auth session payload to domain AuthState.
 */
export function toAuthState(
  data: { user: unknown; session: unknown } | null | undefined,
): AuthState {
  if (!data?.user || !data?.session) {
    return {
      status: "unauthenticated",
      user: null,
      session: null,
    };
  }

  const rawUser = data.user as Record<string, unknown>;
  const rawSession = data.session as Record<string, unknown>;

  const user: User = {
    id: String(rawUser.id),
    name: String(rawUser.name ?? ""),
    email: String(rawUser.email ?? ""),
    emailVerified: Boolean(rawUser.emailVerified),
    image: rawUser.image ? String(rawUser.image) : null,
    createdAt: new Date(rawUser.createdAt as string | number | Date),
    updatedAt: new Date(rawUser.updatedAt as string | number | Date),
  };

  const session: Session = {
    id: String(rawSession.id),
    userId: String(rawSession.userId),
    token: String(rawSession.token),
    expiresAt: new Date(rawSession.expiresAt as string | number | Date),
    ipAddress: rawSession.ipAddress ? String(rawSession.ipAddress) : null,
    userAgent: rawSession.userAgent ? String(rawSession.userAgent) : null,
    createdAt: new Date(rawSession.createdAt as string | number | Date),
    updatedAt: new Date(rawSession.updatedAt as string | number | Date),
  };

  return {
    status: "authenticated",
    user,
    session,
  };
}
