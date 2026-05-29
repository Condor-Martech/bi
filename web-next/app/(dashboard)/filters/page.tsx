"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import type { Filter } from "@/lib/api/endpoints/filters";
import { apiClient } from "@/lib/api/client";
import { useDeleteFilter, useFilters } from "@/lib/hooks/filters";

import { DeleteConfirm } from "../users/_components/delete-confirm";

import { FilterFormDialog } from "./_components/filter-form-dialog";

export default function FiltersPage() {
  const { data: filters = [], isPending, error } = useFilters();
  const del = useDeleteFilter();

  const [me, setMe] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Filter | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Filter | undefined>(undefined);

  // Fetch current user id once on mount — CreateFilterDto requires userId
  // and the legacy `/users` endpoint returns the authenticated profile.
  useEffect(() => {
    apiClient<{ id?: string; _id?: string }>("/api/auth/me")
      .then((u) => setMe(u.id ?? u._id ?? null))
      .catch(() => setMe(null));
  }, []);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(f: Filter) {
    setEditing(f);
    setFormOpen(true);
  }
  function confirmDelete(f: Filter) {
    del.mutate(f._id, {
      onSuccess: () => {
        toast.success("Filtro excluído.");
        setDeleteTarget(undefined);
      },
      onError: (err) => toast.error((err as Error).message ?? "Não foi possível excluir."),
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Filtros row-level</h1>
          <p className="text-sm text-muted-foreground">
            Filtros aplicados ao embed do Power BI conforme o usuário.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!me} className="gap-1.5">
          <Plus className="size-3.5" />
          Criar filtro
        </Button>
      </header>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tabela</TableHead>
              <TableHead>Coluna</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Usuário</TableHead>
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
            {!isPending && !error && filters.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  Nenhum filtro cadastrado.
                </TableCell>
              </TableRow>
            )}
            {filters.map((f) => (
              <TableRow key={f._id}>
                <TableCell className="font-medium">{f.table}</TableCell>
                <TableCell className="text-muted-foreground">{f.column}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {f.value}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {f.userId ?? "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(f)}>
                        <Pencil className="size-3.5" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(f)}
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
        <FilterFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          userId={me}
          filter={editing}
        />
      )}
      <DeleteConfirm
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(undefined);
        }}
        title="Excluir este filtro?"
        description={`O filtro ${deleteTarget?.table}.${deleteTarget?.column}=${deleteTarget?.value} será excluído.`}
        onConfirm={() => deleteTarget && confirmDelete(deleteTarget)}
        isPending={del.isPending}
      />
    </div>
  );
}
