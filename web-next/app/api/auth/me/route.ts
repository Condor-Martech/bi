import { proxyToApi } from "@/lib/api/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me → legacy GET /users (the "me" endpoint, see users.controller.ts:127).
 * Returns the authenticated user's profile populated with refs.
 */
export async function GET(req: Request) {
  return proxyToApi(req, { upstreamPath: "/users" });
}
