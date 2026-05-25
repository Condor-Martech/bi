import { proxyToApi } from "@/lib/api/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ path?: string[] }>;
}

async function handle(req: Request, ctx: Ctx) {
  const { path = [] } = await ctx.params;

  // /maps/upload has its own dedicated handler for multipart streaming.
  // Block it here so the generic JSON-aware proxy can't mangle the boundary.
  if (path[0] === "upload") {
    return Response.json(
      { error: "use_dedicated_endpoint", endpoint: "/api/maps/upload" },
      { status: 404 },
    );
  }

  const upstreamPath = "/maps" + (path.length > 0 ? "/" + path.join("/") : "");
  return proxyToApi(req, { upstreamPath });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
