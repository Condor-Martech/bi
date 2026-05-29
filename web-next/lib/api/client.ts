"use client";

import { ApiAuthError, ApiError, extractApiMessage } from "./types";

export interface ClientFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * Browser-side fetcher. Always calls our OWN BFF at `/api/*` — same origin,
 * cookies sent automatically (httpOnly, browser-managed).
 *
 * - Throws ApiError on non-2xx; ApiAuthError on 401.
 * - Does NOT auto-refresh on 401 — legacy has no JWT refresh endpoint.
 *   Callers handle ApiAuthError by redirecting to `/login`.
 */
export async function apiClient<T = unknown>(
  path: string,
  opts: ClientFetchOptions = {},
): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const headers = new Headers(opts.headers);
  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    if (opts.body instanceof FormData || typeof opts.body === "string") {
      body = opts.body;
    } else {
      if (!headers.has("content-type")) headers.set("content-type", "application/json");
      body = JSON.stringify(opts.body);
    }
  }

  const res = await fetch(url.toString(), {
    ...opts,
    headers,
    body,
    credentials: "include",
  });

  if (res.status === 401) {
    const payload = await safeJson(res);
    throw new ApiAuthError(payload);
  }
  if (!res.ok) {
    const payload = await safeJson(res);
    throw new ApiError(
      res.status,
      payload,
      extractApiMessage(payload, `Request failed ${res.status}`),
    );
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
