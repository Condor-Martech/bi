import "server-only";
import { cookies } from "next/headers";

import { ACCESS_COOKIE } from "@/lib/auth/cookies";

/**
 * SSE proxy: browser EventSource → this route → legacy `/notifications/stream`.
 *
 * Why a dedicated handler (not `proxyToApi`):
 * - The legacy `SseAuthGuard` (see sse-auth.guard.ts in legacy/app) reads the
 *   JWT exclusively from `?token=<jwt>` — it IGNORES the `Authorization` header.
 *   That's because the original consumer is the browser `EventSource`, which
 *   cannot set custom headers. So we replicate that contract here.
 * - The JWT lives in our httpOnly cookie. We pull it server-side and inject it
 *   into the upstream URL as a query param. The browser NEVER sees the JWT —
 *   `?token=...` only appears on the hop server→server.
 *
 * Why `runtime: 'nodejs'`:
 * - Edge runtime does not reliably support long-lived streamed responses with
 *   incremental flushing for SSE. Node runtime is the safe choice.
 *
 * Why `dynamic: 'force-dynamic'`:
 * - This handler must run per-request (it depends on cookies and forwards a
 *   long-lived stream); Next must not attempt static optimization.
 *
 * Abort propagation:
 * - We forward `req.signal` to the upstream `fetch`. When the browser closes
 *   the EventSource, Next aborts the route's request signal, which closes the
 *   upstream connection — preventing dangling subscribers on the legacy.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

export async function GET(req: Request): Promise<Response> {
  const store = await cookies();
  const tokenCookie = store.get(ACCESS_COOKIE);

  if (!tokenCookie?.value) {
    return new Response("Unauthorized", { status: 401 });
  }

  const upstreamUrl = new URL("/notifications/stream", API_URL);
  upstreamUrl.searchParams.set("token", tokenCookie.value);

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        // SSE — ask upstream for the event-stream.
        accept: "text/event-stream",
        "cache-control": "no-cache",
      },
      // Forward browser disconnects to the legacy.
      signal: req.signal,
      // SSE responses must not be cached anywhere.
      cache: "no-store",
    });
  } catch (err) {
    return Response.json(
      { error: "upstream_unreachable", message: (err as Error).message },
      { status: 502 },
    );
  }

  if (!upstreamRes.ok || !upstreamRes.body) {
    // Upstream rejected (likely 401 if token expired). Surface the status.
    return new Response(`Upstream ${upstreamRes.status}`, {
      status: upstreamRes.status,
    });
  }

  // Stream the upstream response body verbatim to the browser, preserving
  // SSE semantics (Content-Type: text/event-stream, no buffering).
  return new Response(upstreamRes.body, {
    status: 200,
    headers: {
      "content-type": upstreamRes.headers.get("content-type") ?? "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      // Disable proxy buffering (nginx & friends).
      "x-accel-buffering": "no",
    },
  });
}
