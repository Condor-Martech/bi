"use client";

import { useEffect, useState } from "react";
import { ExternalLink, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CustomReport } from "@/lib/api/endpoints/custom-reports";
import { apiClient } from "@/lib/api/client";
import { useCustomReports, useDeleteCustomReport } from "@/lib/hooks/custom-reports";

import { DeleteConfirm } from "../users/_components/delete-confirm";

import { CustomReportFormDialog } from "./_components/custom-report-form-dialog";

export default function CustomReportsPage() {
  const { data: reports = [], isPending, error } = useCustomReports();
  const del = useDeleteCustomReport();

  const [me, setMe] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CustomReport | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<CustomReport | undefined>(undefined);

  useEffect(() => {
    apiClient<{ id?: string; _id?: string }>("/api/auth/me")
      .then((u) => setMe(u.id ?? u._id ?? null))
      .catch(() => setMe(null));
  }, []);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(r: CustomReport) {
    setEditing(r);
    setFormOpen(true);
  }
  function confirmDelete(r: CustomReport) {
    del.mutate(r.reportIdPB, {
      onSuccess: () => {
        toast.success("Relatório personalizado excluído.");
        setDeleteTarget(undefined);
      },
      onError: (err) => toast.error((err as Error).message ?? "Não foi possível excluir."),
    });
  }

  function authorLabel(r: CustomReport): string {
    if (!r.author) return "—";
    if (typeof r.author === "string") return r.author;
    return r.author.name ?? r.author.email ?? r.author._id ?? "—";
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Relatórios personalizados</h1>
          <p className="text-sm text-muted-foreground">
            Relatórios externos servidos por URL (não são Power BI nativos).
          </p>
        </div>
        <Button onClick={openCreate} disabled={!me} className="gap-1.5">
          <Plus className="size-3.5" />
          Criar relatório
        </Button>
      </header>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead className="w-24">Abrir</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && (
              <>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {!isPending && error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-destructive">
                  Error: {(error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {!isPending && !error && reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  Ainda não há relatórios personalizados.
                </TableCell>
              </TableRow>
            )}
            {reports.map((r) => (
              <TableRow key={r._id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="line-clamp-1 max-w-xs font-mono text-xs text-muted-foreground">
                  {r.url}
                </TableCell>
                <TableCell className="text-muted-foreground">{authorLabel(r)}</TableCell>
                <TableCell>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="size-3" />
                    Abrir
                  </a>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(r)}>
                        <Pencil className="size-3.5" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(r)}
                      >
                        <Trash2 className="size-3.5" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {me && (
        <CustomReportFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          authorId={me}
          customReport={editing}
        />
      )}
      <DeleteConfirm
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(undefined);
        }}
        title="Excluir este relatório personalizado?"
        description={`"${deleteTarget?.name ?? ""}" será excluído permanentemente.`}
        onConfirm={() => deleteTarget && confirmDelete(deleteTarget)}
        isPending={del.isPending}
      />
    </div>
  );
}
