import { NextResponse } from "next/server";

import { ACCESS_COOKIE } from "@/lib/auth/cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Logout: clear the cookie. The legacy backend has no /logout endpoint —
 * sessions are stateless JWTs, so clearing the cookie is sufficient.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
