import { cookies } from "next/headers";

import { ACCESS_COOKIE } from "@/lib/auth/cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

/**
 * Dedicated multipart passthrough for `POST /maps/upload`.
 *
 * Why this can't use the generic `proxyToApi`:
 *  - The generic proxy is content-type agnostic but tested with JSON.
 *  - Multer on the legacy side parses `multipart/form-data` and reads the
 *    boundary from the Content-Type header. We must preserve that header
 *    EXACTLY and stream the body without touching it.
 *
 * Implementation details:
 *  - `req.body` is a ReadableStream → forward verbatim.
 *  - `duplex: 'half'` is required by Node fetch when streaming a request body.
 *  - Forward `req.signal` so a client abort propagates upstream (don't leak
 *    half-written files on the legacy disk).
 *  - Do NOT set Content-Type ourselves — copy from `req.headers`.
 */
export async function POST(req: Request) {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type");
  if (!contentType?.startsWith("multipart/form-data")) {
    return Response.json(
      { error: "invalid_content_type", expected: "multipart/form-data" },
      { status: 400 },
    );
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(`${API_URL}/maps/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": contentType,
      },
      body: req.body,
      signal: req.signal,
      // Required by Node 18+ when streaming a request body.
      ...{ duplex: "half" },
    } as RequestInit);
  } catch (err) {
    return Response.json(
      { error: "upstream_unreachable", message: (err as Error).message },
      { status: 502 },
    );
  }

  const respHeaders = new Headers();
  upstreamRes.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "set-cookie") return;
    if (lower === "transfer-encoding" || lower === "connection") return;
    respHeaders.set(key, value);
  });

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: respHeaders,
  });
}
