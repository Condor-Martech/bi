"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/patterns/data-table/data-table";
import { roleLabel } from "@/lib/auth/roles";
import {
  aggregateByUser,
  type AggregatedUser,
  type LoginLogRow,
} from "./types";

interface ByUserTableProps {
  rows: LoginLogRow[];
  loading?: boolean;
  emptyState?: string;
  onSelectUser: (userKey: string) => void;
}

export function ByUserTable({ rows, loading, emptyState, onSelectUser }: ByUserTableProps) {
  const data = useMemo<AggregatedUser[]>(
    () => aggregateByUser(rows).sort((a, b) => b.lastAccessMs - a.lastAccessMs),
    [rows],
  );

  const columns = useMemo<ColumnDef<AggregatedUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Usuario",
        cell: ({ row }) => (
          <span className={row.original.isDeleted ? "text-muted-foreground italic" : "font-medium"}>
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
        accessorKey: "count",
        header: "Accesos",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono">
            {row.original.count}
          </Badge>
        ),
      },
      {
        accessorKey: "lastAccessMs",
        header: "Último acceso",
        cell: ({ row }) => {
          const r = row.original;
          const label =
            r.lastAccessMs > 0
              ? new Date(r.lastAccessMs).toLocaleString("es-AR")
              : r.lastAccessRaw;
          return <span className="font-mono text-xs text-muted-foreground">{label}</span>;
        },
      },
      {
        id: "actions",
        header: "",
        cell: () => <ChevronRight className="size-3.5 text-muted-foreground" />,
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
      onRowClick={(row) => onSelectUser(row.key)}
    />
  );
}
