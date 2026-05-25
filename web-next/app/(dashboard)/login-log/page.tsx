"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { History, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/patterns/data-table/data-table";
import type { LoginLog } from "@/lib/api/endpoints/login-log";
import { ROLES } from "@/lib/api/endpoints/users";
import { useLoginLogs } from "@/lib/hooks/login-log";
import { roleLabel } from "@/lib/auth/roles";

type RoleFilter = "all" | (typeof ROLES)[number];

/**
 * Parse the legacy `loginTime` string (`Date.toString()` output in Brasilia time)
 * into a Date best-effort. If parsing fails, render the raw string.
 */
function parseLegacyDate(s: string): Date | null {
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t);
}

interface LoginLogRow {
  id: string;
  name: string;
  email: string;
  role: string;
  loginTimeRaw: string;
  loginTimeMs: number;
}

function toRow(log: LoginLog): LoginLogRow {
  const isObjectUser = log.user && typeof log.user !== "string";
  const name = isObjectUser ? (log.user as { name?: string }).name ?? "—" : "—";
  const email = isObjectUser
    ? (log.user as { email?: string }).email ?? "—"
    : typeof log.user === "string"
      ? log.user
      : "—";
  const role = isObjectUser ? (log.user as { role?: string }).role ?? "—" : "—";
  const parsed = parseLegacyDate(log.loginTime);
  return {
    id: log._id,
    name,
    email,
    role,
    loginTimeRaw: log.loginTime,
    loginTimeMs: parsed ? parsed.getTime() : 0,
  };
}

export default function LoginLogPage() {
  const { data: logs = [], isPending, error } = useLoginLogs();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const rows = useMemo<LoginLogRow[]>(() => {
    const mapped = logs.map(toRow);
    const q = search.trim().toLowerCase();
    const filtered = mapped.filter((r) => {
      if (roleFilter !== "all" && r.role !== roleFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q)
      );
    });
    // Most recent first by default — audit logs are read newest-to-oldest.
    return filtered.sort((a, b) => b.loginTimeMs - a.loginTimeMs);
  }, [logs, search, roleFilter]);

  const columns = useMemo<ColumnDef<LoginLogRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Usuario",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
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
          return (
            <span className="font-mono text-xs text-muted-foreground">{label}</span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Auditoría de logins</h1>
        </div>
        <Badge variant="secondary" className="font-mono">
          {logs.length} registros
        </Badge>
      </header>
      <p className="text-sm text-muted-foreground">
        Historial completo de logins. Restringido a MANAGER.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email…"
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
        <Card>
          <CardContent className="py-6 text-center text-sm text-destructive">
            Error: {(error as Error).message}
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          loading={isPending}
          density="cozy"
          pageSize={25}
          emptyState={
            logs.length === 0
              ? "Sin registros de login."
              : "Sin resultados para los filtros aplicados."
          }
        />
      )}
    </div>
  );
}
