"use client";

import { useMemo, useState } from "react";
import { CalendarClock, History, Search, Users } from "lucide-react";

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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ROLES } from "@/lib/api/endpoints/users";
import { useLoginLogs } from "@/lib/hooks/login-log";
import { roleLabel } from "@/lib/auth/roles";

import { ByDateTable } from "./_components/by-date-table";
import { ByUserTable } from "./_components/by-user-table";
import { toRow, type LoginLogRow } from "./_components/types";
import { UserHistorySheet } from "./_components/user-history-sheet";

type RoleFilter = "all" | (typeof ROLES)[number];
type View = "by-user" | "by-date";

export default function LoginLogPage() {
  const { data: logs = [], isPending, error } = useLoginLogs();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [view, setView] = useState<View>("by-user");
  const [selectedUserKey, setSelectedUserKey] = useState<string | null>(null);

  const rows = useMemo<LoginLogRow[]>(() => {
    const mapped = logs.map(toRow);
    const q = search.trim().toLowerCase();
    return mapped.filter((r) => {
      if (roleFilter !== "all" && r.role !== roleFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q)
      );
    });
  }, [logs, search, roleFilter]);

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
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
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

        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => {
            if (v === "by-user" || v === "by-date") setView(v);
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="by-user" aria-label="Agrupar por usuario" className="text-xs">
            <Users className="size-3.5" />
            Por usuario
          </ToggleGroupItem>
          <ToggleGroupItem value="by-date" aria-label="Ordenar por fecha" className="text-xs">
            <CalendarClock className="size-3.5" />
            Por fecha
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-6 text-center text-sm text-destructive">
            Error: {(error as Error).message}
          </CardContent>
        </Card>
      ) : view === "by-user" ? (
        <ByUserTable
          rows={rows}
          loading={isPending}
          onSelectUser={setSelectedUserKey}
          emptyState={
            logs.length === 0
              ? "Sin registros de login."
              : "Sin resultados para los filtros aplicados."
          }
        />
      ) : (
        <ByDateTable
          rows={rows}
          loading={isPending}
          emptyState={
            logs.length === 0
              ? "Sin registros de login."
              : "Sin resultados para los filtros aplicados."
          }
        />
      )}

      <UserHistorySheet
        rows={rows}
        selectedUserKey={selectedUserKey}
        onOpenChange={(open) => {
          if (!open) setSelectedUserKey(null);
        }}
      />
    </div>
  );
}
