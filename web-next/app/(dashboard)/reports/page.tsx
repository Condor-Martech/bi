import Link from "next/link";
import { redirect } from "next/navigation";
import { FileBarChart2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiServer } from "@/lib/api/server";
import { ApiAuthError } from "@/lib/api/types";

/**
 * Shape of a report record as returned by `GET /reports/me`.
 *
 * Defensive: the legacy returns raw Mongo docs in some flows. We accept both
 * `_id` and `id`, both `reportIdPB` and `reportId`, and treat all fields as optional.
 */
interface Report {
  _id?: string;
  id?: string;
  name?: string;
  reportIdPB?: string;
  webUrl?: string;
  groupByPB?: string;
  accountID?: string | { _id?: string; name?: string };
  [key: string]: unknown;
}

export default async function ReportsPage() {
  let reports: Report[];
  try {
    reports = await apiServer<Report[]>("/reports/me");
  } catch (err) {
    if (err instanceof ApiAuthError) redirect("/login");
    throw err;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
        <Badge variant="secondary" className="font-mono">
          {reports.length} disponibles
        </Badge>
      </header>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <FileBarChart2 className="h-6 w-6" />
            No hay reportes asignados a tu usuario.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => {
            const reportId = r.reportIdPB ?? "";
            const key = r._id ?? r.id ?? reportId ?? r.name ?? Math.random().toString(36);
            const href = reportId ? `/report/${reportId}` : "#";
            return (
              <Link key={key} href={href} className="block">
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2 text-sm font-medium">
                      {r.name ?? "Reporte sin nombre"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-1 font-mono text-xs text-muted-foreground">
                      {reportId || "—"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
