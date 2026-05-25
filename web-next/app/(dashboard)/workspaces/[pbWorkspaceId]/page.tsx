import { redirect } from "next/navigation";
import { Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { apiServer } from "@/lib/api/server";
import { ApiAuthError } from "@/lib/api/types";

import { ReportsGrid } from "./_components/reports-grid";

interface MeReport {
  id: string;
  workspaceId: string;
  pbReportId: string;
  name: string;
  embedUrl: string;
  webUrl: string;
  lastSyncedAt: string | null;
}

interface Props {
  params: Promise<{ pbWorkspaceId: string }>;
  searchParams: Promise<{ name?: string }>;
}

export default async function WorkspaceReportsPage({ params, searchParams }: Props) {
  const { pbWorkspaceId } = await params;
  const { name } = await searchParams;

  let reports: MeReport[];
  try {
    reports = await apiServer<MeReport[]>("/me/reports", { query: { pbWorkspaceId } });
  } catch (err) {
    if (err instanceof ApiAuthError) redirect("/login");
    throw err;
  }

  const title = name?.trim() || pbWorkspaceId;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <Layers className="h-5 w-5 shrink-0 text-muted-foreground" />
          <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        <Badge variant="secondary" className="font-mono">
          {reports.length} relatórios
        </Badge>
      </header>

      <ReportsGrid reports={reports} />
    </div>
  );
}
