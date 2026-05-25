import { proxyToApi } from "@/lib/api/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return proxyToApi(req, { upstreamPath: "/me/reports" });
}
