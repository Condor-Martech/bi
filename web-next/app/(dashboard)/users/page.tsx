"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Search, Trash2, UserPen } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/patterns/data-table/data-table";
import { useDeleteUser, useUsers } from "@/lib/hooks/users";
import { ROLES, type UserListItem } from "@/lib/api/endpoints/users";
import { roleLabel } from "@/lib/auth/roles";

import { DeleteConfirm } from "./_components/delete-confirm";
import { UserFormDialog } from "./_components/user-form-dialog";

type RoleFilter = "all" | (typeof ROLES)[number];

export default function UsersPage() {
  const { data: users = [], isPending, error } = useUsers();
  const del = useDeleteUser();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserListItem | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | undefined>(undefined);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(u: UserListItem) {
    setEditing(u);
    setFormOpen(true);
  }
  function confirmDelete(u: UserListItem) {
    if (!u._id) return;
    del.mutate(u._id, {
      onSuccess: () => {
        toast.success("Usuario eliminado.");
        setDeleteTarget(undefined);
      },
      onError: (err) => toast.error((err as Error).message ?? "No se pudo eliminar."),
    });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      const haystack = `${u.name ?? ""} ${u.email ?? ""} ${u.userIslv ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [users, search, roleFilter]);

  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name ?? "—"}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email ?? "—"}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => (
          <Badge variant="outline">{roleLabel(row.original.role)}</Badge>
        ),
      },
      {
        accessorKey: "userIslv",
        header: "ISLV",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.userIslv ?? "—"}
          </span>
        ),
      },
      {
        id: "__actions",
        enableSorting: false,
        size: 48,
        header: () => null,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEdit(u)}>
                  <UserPen className="size-3.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteTarget(u)}
                >
                  <Trash2 className="size-3.5" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de usuarios con acceso a la plataforma. Restringido a MANAGER.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="size-3.5" />
          Crear usuario
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o ISLV…"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as RoleFilter)}
        >
          <SelectTrigger size="sm" className="h-8 w-full text-xs sm:w-40">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {roleLabel(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="border-border bg-card rounded-md border p-6 text-center text-sm text-destructive">
          Error al cargar usuarios: {(error as Error).message}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          loading={isPending}
          density="cozy"
          pageSize={10}
          emptyState={
            users.length === 0
              ? "No hay usuarios todavía."
              : "Sin resultados para los filtros aplicados."
          }
        />
      )}

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} />

      <DeleteConfirm
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(undefined);
        }}
        title="¿Eliminar este usuario?"
        description={`Se borra ${deleteTarget?.name ?? "el usuario"} permanentemente. No se puede deshacer.`}
        onConfirm={() => deleteTarget && confirmDelete(deleteTarget)}
        isPending={del.isPending}
      />
    </div>
  );
}
