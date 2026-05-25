"use client";

import { useState } from "react";
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
import type { UserGroup } from "@/lib/api/endpoints/user-groups";
import { useDeleteUserGroup, useUserGroups } from "@/lib/hooks/user-groups";

import { DeleteConfirm } from "../users/_components/delete-confirm";
import { GroupFormDialog } from "./_components/group-form-dialog";

export default function GruposPage() {
  const { data: groups = [], isPending, error } = useUserGroups();
  const del = useDeleteUserGroup();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserGroup | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<UserGroup | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(g: UserGroup) {
    setEditing(g);
    setFormOpen(true);
  }
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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Grupos de usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Agrupaciones que asignan reportes Power BI a múltiples usuarios. MANAGER.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="size-3.5" />
          Crear grupo
        </Button>
      </header>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cuenta BI</TableHead>
              <TableHead>Miembros</TableHead>
              <TableHead>Reportes</TableHead>
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
            {!isPending && !error && groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  No hay grupos creados.
                </TableCell>
              </TableRow>
            )}
            {groups.map((g) => (
              <TableRow key={g._id}>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {g.accountID}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{g.users?.length ?? 0}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{g.reports?.length ?? 0}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(g)}>
                        <Pencil className="size-3.5" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(g)}
                      >
                        <Trash2 className="size-3.5" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <GroupFormDialog open={formOpen} onOpenChange={setFormOpen} group={editing} />
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
