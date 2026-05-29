"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, FileText, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserGroup } from "@/lib/api/endpoints/user-groups";
import { useAccounts } from "@/lib/hooks/accounts";
import { useDeleteUserGroup, useUserGroups } from "@/lib/hooks/user-groups";

import { DeleteConfirm } from "../users/_components/delete-confirm";
import { GroupCreateSheet } from "./_components/group-create-sheet";

export default function GruposPage() {
  const router = useRouter();
  const { data: groups = [], isPending, error } = useUserGroups();
  const { data: accounts = [] } = useAccounts();
  const del = useDeleteUserGroup();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserGroup | undefined>(undefined);
  const [query, setQuery] = useState("");

  const accountById = useMemo(
    () => new Map(accounts.map((a) => [a._id, a])),
    [accounts],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups.filter((g) => {
      const acc = accountById.get(g.accountID);
      return (
        g.name.toLowerCase().includes(q) ||
        acc?.nameAccount?.toLowerCase().includes(q) ||
        acc?.email?.toLowerCase().includes(q)
      );
    });
  }, [groups, accountById, query]);

  function confirmDelete(g: UserGroup) {
    del.mutate(g._id, {
      onSuccess: () => {
        toast.success("Grupo eliminado.");
        setDeleteTarget(undefined);
      },
      onError: (err) => toast.error((err as Error).message ?? "No se pudo eliminar."),
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Grupos de usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Agrupan usuarios y asignan reportes Power BI en masa. Sólo MANAGER.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="size-3.5" />
          Crear grupo
        </Button>
      </header>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por grupo o cuenta…"
          className="pl-8"
        />
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cuenta BI</TableHead>
              <TableHead className="w-28">Miembros</TableHead>
              <TableHead className="w-28">Reportes</TableHead>
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
            {!isPending && !error && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10">
                  <EmptyState>
                    <EmptyStateIcon asChild>
                      <Users />
                    </EmptyStateIcon>
                    <EmptyStateTitle>
                      {query ? "Sin resultados" : "No hay grupos"}
                    </EmptyStateTitle>
                    <EmptyStateDescription>
                      {query
                        ? "Probá con otro término de búsqueda."
                        : "Creá tu primer grupo para asignar reportes a varios usuarios."}
                    </EmptyStateDescription>
                  </EmptyState>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((g) => {
              const acc = accountById.get(g.accountID);
              return (
                <TableRow
                  key={g._id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => router.push(`/grupos/${g._id}`)}
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/grupos/${g._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline"
                    >
                      {g.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {acc ? (
                      <div className="flex flex-col">
                        <span className="text-foreground">{acc.nameAccount}</span>
                        <span className="text-xs">{acc.email}</span>
                      </div>
                    ) : (
                      <span className="font-mono text-xs">{g.accountID}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="size-3" />
                      {g.users?.length ?? 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <FileText className="size-3" />
                      {g.reports?.length ?? 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(g);
                        }}
                        aria-label={`Eliminar ${g.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <GroupCreateSheet open={createOpen} onOpenChange={setCreateOpen} />
      <DeleteConfirm
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(undefined);
        }}
        title="¿Eliminar este grupo?"
        description={`Se elimina ${deleteTarget?.name ?? "el grupo"} y se desvinculan sus miembros.`}
        onConfirm={() => deleteTarget && confirmDelete(deleteTarget)}
        isPending={del.isPending}
      />
    </div>
  );
}
