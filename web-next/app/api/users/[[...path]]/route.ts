import { proxyToApi } from "@/lib/api/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ path?: string[] }>;
}

async function handle(req: Request, ctx: Ctx) {
  const { path = [] } = await ctx.params;

  // /users/login has its own dedicated handler at /api/auth/login that sets the cookie.
  // Block direct hits here so callers can't bypass cookie handling.
  if (path[0] === "login") {
    return Response.json(
      { error: "use_dedicated_endpoint", endpoint: "/api/auth/login" },
      { status: 404 },
    );
  }

  const upstreamPath = "/users" + (path.length > 0 ? "/" + path.join("/") : "");
  return proxyToApi(req, { upstreamPath });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
