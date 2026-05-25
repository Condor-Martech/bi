import { NextResponse } from "next/server";
import { z } from "zod";

import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { jwtExpirySeconds } from "@/lib/auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Login response from the legacy backend.
 *
 * Confirmed against `legacy/app/src/app/modules/users/users.controller.ts` —
 * `usersService.logon()` returns a UserResponseDto that includes `access_token`.
 * The full shape varies; we only require `access_token` and forward the rest.
 */
const loginResponseSchema = z
  .object({
    access_token: z.string().min(10),
  })
  .passthrough();

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = loginBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_credentials_format", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "upstream_unreachable", message: (err as Error).message },
      { status: 502 },
    );
  }

  // Legacy throws either 401 (UnauthorizedException) or 400 (BadRequestException — its catch
  // re-throws as "Requisição inválida") for invalid credentials. Normalize both to 401.
  if (upstream.status === 401 || upstream.status === 400) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }
  if (!upstream.ok) {
    return NextResponse.json(
      { error: "upstream_error", status: upstream.status },
      { status: 502 },
    );
  }

  let json: unknown;
  try {
    json = await upstream.json();
  } catch {
    return NextResponse.json({ error: "upstream_invalid_response" }, { status: 502 });
  }

  const result = loginResponseSchema.safeParse(json);
  if (!result.success) {
    return NextResponse.json(
      { error: "upstream_invalid_shape", issues: result.error.flatten() },
      { status: 502 },
    );
  }

  // Strip access_token from the body returned to the browser — keep it cookie-only.
  const { access_token, ...userFields } = result.data;
  const maxAge = jwtExpirySeconds(access_token);

  const res = NextResponse.json({ user: userFields });
  res.cookies.set(ACCESS_COOKIE, access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}
