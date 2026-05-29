import { notFound, redirect } from "next/navigation";
import { ChartBar, Database, ExternalLink, Folder } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiServer } from "@/lib/api/server";
import { ApiAuthError, ApiError } from "@/lib/api/types";
import { reportDetailSchema, type ReportDetail } from "@/lib/api/endpoints/reports";

import { FavouriteButton } from "./_components/favourite-button";
import { PowerBIReport } from "./_components/power-bi-report";

interface PageProps {
  params: Promise<{ reportId: string }>;
}

// Mongo ObjectId is 24 hex chars; Power BI reportId is a UUID v4 (36 chars w/ dashes).
// Validate loosely — accept either. Hard-block obvious garbage.
const REPORT_ID_RE = /^[a-zA-Z0-9-]{16,64}$/;

export default async function ReportPage({ params }: PageProps) {
  const { reportId } = await params;
  if (!REPORT_ID_RE.test(reportId)) notFound();

  let detail: ReportDetail;
  try {
    const raw = await apiServer<unknown>(`/reports/${encodeURIComponent(reportId)}`);
    detail = reportDetailSchema.parse(raw);
  } catch (err) {
    if (err instanceof ApiAuthError) redirect("/login");
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const accountName = detail.accountID.nameAccount ?? detail.accountID.email ?? "Cuenta";

  return (
    <div className="flex h-screen flex-col">
      <header className="flex flex-col gap-3 border-b border-border bg-background px-6 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Database className="size-3.5" />
          <span>{accountName}</span>
          {detail.groupIdPB && (
            <>
              <span>/</span>
              <Folder className="size-3.5" />
              <span className="font-mono text-[11px]">{detail.groupIdPB}</span>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{detail.name ?? "Reporte"}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ChartBar className="size-3" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold leading-tight">
                {detail.name ?? "Reporte sin nombre"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FavouriteButton reportIdPB={detail.reportIdPB} />
            <Button variant="secondary" size="sm" asChild>
              <a
                href={detail.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-1.5"
              >
                <ExternalLink className="size-3.5" />
                Abrir en Power BI
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden bg-muted/30 p-6">
        <PowerBIReport reportId={detail.reportIdPB} initialData={detail} />
      </div>
    </div>
  );
}
