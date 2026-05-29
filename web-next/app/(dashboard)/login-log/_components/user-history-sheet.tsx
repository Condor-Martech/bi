"use client";

import { useMemo } from "react";
import { Clock, Mail, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { roleLabel } from "@/lib/auth/roles";
import type { LoginLogRow } from "./types";

interface UserHistorySheetProps {
  rows: LoginLogRow[];
  selectedUserKey: string | null;
  onOpenChange: (open: boolean) => void;
}

export function UserHistorySheet({
  rows,
  selectedUserKey,
  onOpenChange,
}: UserHistorySheetProps) {
  const userRows = useMemo(() => {
    if (!selectedUserKey) return [];
    return rows
      .filter((r) => r.userKey === selectedUserKey)
      .sort((a, b) => b.loginTimeMs - a.loginTimeMs);
  }, [rows, selectedUserKey]);

  const header = userRows[0];
  const firstAccessMs = userRows.reduce(
    (acc, r) => (r.loginTimeMs > 0 && (acc === 0 || r.loginTimeMs < acc) ? r.loginTimeMs : acc),
    0,
  );

  return (
    <Sheet open={selectedUserKey !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {header?.name ?? "Historial de acceso"}
            {header?.isDeletedUser ? (
              <Badge variant="outline" className="ml-2 text-[10px]">
                Eliminado
              </Badge>
            ) : null}
          </SheetTitle>
          <SheetDescription>
            {userRows.length} {userRows.length === 1 ? "acceso registrado" : "accesos registrados"}
          </SheetDescription>
        </SheetHeader>

        {header ? (
          <div className="flex flex-col gap-2 border-b px-4 pb-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-3.5" />
              <span>{header.email}</span>
            </div>
            {header.role !== "—" ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="size-3.5" />
                <Badge variant="outline" className="capitalize">
                  {roleLabel(header.role)}
                </Badge>
              </div>
            ) : null}
            {firstAccessMs > 0 ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-3.5" />
                <span>
                  Primer acceso registrado:{" "}
                  <span className="font-mono">
                    {new Date(firstAccessMs).toLocaleString("es-AR")}
                  </span>
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <ol className="relative ml-2 space-y-3 border-l pl-4">
            {userRows.map((r) => {
              const label =
                r.loginTimeMs > 0
                  ? new Date(r.loginTimeMs).toLocaleString("es-AR")
                  : r.loginTimeRaw;
              return (
                <li key={r.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                  <span className="block font-mono text-xs text-foreground">{label}</span>
                </li>
              );
            })}
            {userRows.length === 0 ? (
              <li className="text-xs text-muted-foreground">Sin accesos registrados.</li>
            ) : null}
          </ol>
        </div>
      </SheetContent>
    </Sheet>
  );
}
