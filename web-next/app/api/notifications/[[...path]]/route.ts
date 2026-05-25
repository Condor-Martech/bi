import { proxyToApi } from "@/lib/api/proxy";

/**
 * Catch-all BFF for `/notifications/*` (everything EXCEPT `/stream`, which has
 * its own dedicated handler at `../stream/route.ts`). Next prioritizes static
 * segments over catch-all dynamic ones, so `/api/notifications/stream` is
 * matched by `stream/route.ts`, not this file.
 *
 * Endpoints proxied here:
 *   - GET    /notifications?page=&limit=     — paginated list for current user
 *   - POST   /notifications                   — broadcast (MANAGER only)
 *   - GET    /notifications/:id               — single
 *   - PATCH  /notifications/:notifId/user/:userId — mark as read
 *   - DELETE /notifications/:id               — delete
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ path?: string[] }>;
}

async function handle(req: Request, ctx: Ctx) {
  const { path = [] } = await ctx.params;
  const upstreamPath = "/notifications" + (path.length > 0 ? "/" + path.join("/") : "");
  return proxyToApi(req, { upstreamPath });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
