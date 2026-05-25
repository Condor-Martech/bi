import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_COOKIE } from "./cookies";
import { decodeJwt, isJwtExpired, type JwtPayload } from "./jwt";

export interface Session {
  token: string;
  payload: JwtPayload;
}

/**
 * Read the session from the cookie. Returns null if missing, expired, or malformed.
 *
 * RSC-safe: `cookies()` is async since Next 15+.
 */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const cookie = store.get(ACCESS_COOKIE);
  if (!cookie?.value) return null;
  const token = cookie.value;
  if (isJwtExpired(token)) return null;
  const payload = decodeJwt(token);
  if (!payload) return null;
  return { token, payload };
}

/**
 * Require a session in an RSC. Redirects to /login if missing.
 * Returns `never` (via throw) when there is no session.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login"); // throws — never returns
  return session;
}
