/**
 * Single cookie that carries the legacy JWT.
 *
 * Distinct name from `bi_access`/`bi_refresh` (used by `new-bi/apps/web`) so the
 * two apps can coexist on the same host during transition.
 */
export const ACCESS_COOKIE = "bi_token";

export interface AccessCookieOptions {
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
  path: string;
  maxAge?: number;
}

const BASE: Omit<AccessCookieOptions, "maxAge"> = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function accessCookieOptions(maxAgeSeconds: number): AccessCookieOptions {
  return { ...BASE, maxAge: maxAgeSeconds };
}

export function clearCookieOptions(): AccessCookieOptions {
  return { ...BASE, maxAge: 0 };
}
