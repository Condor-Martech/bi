"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/patterns/data-table/data-table";
import { roleLabel } from "@/lib/auth/roles";
import type { LoginLogRow } from "./types";

interface ByDateTableProps {
  rows: LoginLogRow[];
  loading?: boolean;
  emptyState?: string;
}

export function ByDateTable({ rows, loading, emptyState }: ByDateTableProps) {
  const data = useMemo(
    () => [...rows].sort((a, b) => b.loginTimeMs - a.loginTimeMs),
    [rows],
  );

  const columns = useMemo<ColumnDef<LoginLogRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Usuario",
        cell: ({ row }) => (
          <span
            className={
              row.original.isDeletedUser ? "text-muted-foreground italic" : "font-medium"
            }
          >
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.role === "—" ? "—" : roleLabel(row.original.role)}
          </Badge>
        ),
      },
      {
        accessorKey: "loginTimeMs",
        header: "Fecha y hora",
        cell: ({ row }) => {
          const r = row.original;
          const label =
            r.loginTimeMs > 0
              ? new Date(r.loginTimeMs).toLocaleString("es-AR")
              : r.loginTimeRaw;
          return <span className="font-mono text-xs text-muted-foreground">{label}</span>;
        },
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      density="cozy"
      pageSize={25}
      emptyState={emptyState}
    />
  );
}
