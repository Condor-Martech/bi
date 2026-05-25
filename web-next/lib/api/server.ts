import "server-only";
import { cookies } from "next/headers";

import { ACCESS_COOKIE } from "@/lib/auth/cookies";

import { ApiAuthError, ApiError } from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

export interface ServerFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * Server-side fetcher for RSC and route handlers.
 *
 * - Goes DIRECTLY to the legacy upstream (no round-trip through our BFF).
 * - Attaches `Authorization: Bearer <bi_token>` from the cookie.
 * - Throws ApiError on non-2xx; ApiAuthError on 401.
 * - Does NOT refresh on 401 — the legacy has no JWT refresh endpoint.
 *   Callers in RSC should catch ApiAuthError and trigger `redirect('/login')`.
 */
export async function apiServer<T = unknown>(
  path: string,
  opts: ServerFetchOptions = {},
): Promise<T> {
  const store = await cookies();
  const tokenCookie = store.get(ACCESS_COOKIE);

  const url = new URL(`${API_URL}${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const headers = new Headers(opts.headers);
  if (tokenCookie?.value && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${tokenCookie.value}`);
  }

  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    if (opts.body instanceof FormData || typeof opts.body === "string") {
      body = opts.body;
    } else {
      if (!headers.has("content-type")) headers.set("content-type", "application/json");
      body = JSON.stringify(opts.body);
    }
  }

  const res = await fetch(url, {
    ...opts,
    headers,
    body,
    cache: opts.cache ?? "no-store",
  });

  if (res.status === 401) {
    const payload = await safeJson(res);
    throw new ApiAuthError(payload);
  }
  if (!res.ok) {
    const payload = await safeJson(res);
    throw new ApiError(res.status, payload, `Upstream ${res.status} ${res.statusText}`);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    try {
      return await res.text();
    } catch {
      return null;
    }
  }
}
