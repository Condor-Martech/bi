"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileBarChart2, Search } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface MeReport {
  id: string;
  pbReportId: string;
  name: string;
}

interface Props {
  reports: MeReport[];
}

export function ReportsGrid({ reports }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(
      (r) => r.name.toLowerCase().includes(q) || r.pbReportId.toLowerCase().includes(q),
    );
  }, [search, reports]);

  const hasFilter = search.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar relatório por nome ou ID…"
            className="h-8 pl-8 text-xs"
          />
        </div>
        {hasFilter ? (
          <p className="text-xs text-muted-foreground">
            {filtered.length} de {reports.length} relatórios
          </p>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center justify-center gap-2 rounded-md border py-16 text-sm text-muted-foreground">
          <FileBarChart2 className="size-5" />
          {reports.length === 0
            ? "Nenhum relatório disponível neste workspace."
            : "Sem resultados para a busca."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Link key={r.id} href={`/report/${r.pbReportId}`} className="block">
              <Card className="transition-colors hover:bg-accent">
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-2 text-sm font-medium">{r.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-1 font-mono text-xs text-muted-foreground">
                    {r.pbReportId}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
