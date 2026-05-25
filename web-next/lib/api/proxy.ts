import "server-only";
import { cookies } from "next/headers";

import { ACCESS_COOKIE } from "@/lib/auth/cookies";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

/** Headers we MUST NOT forward back to the browser. */
const STRIP_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  // Never forward upstream cookie semantics to our origin's browser.
  "set-cookie",
]);

export interface ProxyOptions {
  /** Path on the upstream legacy API, including leading slash. e.g. "/reports/me" */
  upstreamPath: string;
  /** Override the upstream method (default: req.method). */
  method?: string;
  /** Force body forwarding on/off. Default: forward for non-GET/HEAD. */
  forwardBody?: boolean;
  /** Extra headers to send TO upstream (in addition to Authorization + content-type). */
  extraHeaders?: HeadersInit;
}

/**
 * Forward `req` to the legacy backend at `upstreamPath` + searchParams,
 * attaching `Authorization: Bearer <bi_token>` from the cookie.
 *
 * Key behaviors (vs apps/web's proxy):
 *  - Forwards `req.nextUrl.searchParams` (apps/web's proxy DROPS them — bug).
 *  - Streams the body with `duplex: 'half'` (required for multipart and SSE).
 *  - Strips upstream `Set-Cookie` and hop-by-hop headers before returning.
 *  - Preserves upstream status, Content-Type, Cache-Control.
 *  - Forwards `req.signal` so a browser disconnect aborts the upstream fetch
 *    (prevents leak of dangling subscribers on the legacy side, esp. SSE).
 */
export async function proxyToApi(req: Request, opts: ProxyOptions): Promise<Response> {
  const store = await cookies();
  const tokenCookie = store.get(ACCESS_COOKIE);

  const url = new URL(req.url);
  const upstreamUrl = `${API_URL}${opts.upstreamPath}${url.search}`;

  const method = opts.method ?? req.method;
  const forwardBody = opts.forwardBody ?? !["GET", "HEAD"].includes(method);

  const headers = new Headers(opts.extraHeaders);
  if (tokenCookie?.value) {
    headers.set("Authorization", `Bearer ${tokenCookie.value}`);
  }
  for (const h of ["content-type", "accept", "cache-control"]) {
    const v = req.headers.get(h);
    if (v) headers.set(h, v);
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstreamUrl, {
      method,
      headers,
      body: forwardBody ? req.body : undefined,
      redirect: "manual",
      signal: req.signal,
      // `duplex` is required by Node when streaming a body. The DOM RequestInit
      // type doesn't expose it; cast through a local type.
      ...(forwardBody ? { duplex: "half" } : {}),
    } as RequestInit);
  } catch (err) {
    const e = err as Error & { cause?: Error & { code?: string } };
    const cause = e.cause;
    console.error("[proxy] upstream fetch failed", {
      upstreamUrl,
      method,
      message: e.message,
      causeMessage: cause?.message,
      causeCode: cause?.code,
      causeStack: cause?.stack?.split("\n").slice(0, 5).join("\n"),
    });
    return Response.json(
      {
        error: "upstream_unreachable",
        message: e.message,
        cause: cause?.message,
        code: cause?.code,
        upstreamUrl,
      },
      { status: 502 },
    );
  }

  const respHeaders = new Headers();
  upstreamRes.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      respHeaders.set(key, value);
    }
  });

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: respHeaders,
  });
}
