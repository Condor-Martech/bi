"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, FileText, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserGroup } from "@/lib/api/endpoints/user-groups";
import { useAllReports } from "@/lib/hooks/reports";
import { useUpdateUserGroup } from "@/lib/hooks/user-groups";

interface Props {
  group: UserGroup;
}

export function ReportsSection({ group }: Props) {
  const { data: allReports = [], isPending } = useAllReports();
  const update = useUpdateUserGroup();

  const initial = useMemo(() => new Set(group.reports ?? []), [group.reports]);
  const [selected, setSelected] = useState<Set<string>>(initial);
  const [query, setQuery] = useState("");
  const [popOpen, setPopOpen] = useState(false);

  useEffect(() => setSelected(new Set(group.reports ?? [])), [group.reports]);

  const dirty =
    selected.size !== initial.size ||
    [...selected].some((id) => !initial.has(id));

  const reportByPB = useMemo(() => {
    const map = new Map<string, (typeof allReports)[number]>();
    for (const r of allReports) {
      if (r.reportIdPB) map.set(r.reportIdPB, r);
    }
    return map;
  }, [allReports]);

  const assigned = [...selected]
    .map((id) => reportByPB.get(id))
    .filter((r): r is (typeof allReports)[number] => Boolean(r));

  const orphans = [...selected].filter((id) => !reportByPB.has(id));

  const searchable = allReports.filter((r) => {
    const id = r.reportIdPB;
    if (!id) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (r.name?.toLowerCase().includes(q) ?? false) || id.toLowerCase().includes(q);
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function remove(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }
  function reset() {
    setSelected(new Set(group.reports ?? []));
  }
  function save() {
    update.mutate(
      { id: group._id, body: { reports: [...selected] } },
      {
        onSuccess: () => toast.success("Reportes actualizados."),
        onError: (err) => toast.error((err as Error).message ?? "Error al guardar."),
      },
    );
  }

  return (
    <div className="space-y-4 rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Reportes asignados</h2>
          <p className="text-xs text-muted-foreground">
            Power BI reports que los miembros del grupo pueden ver.
          </p>
        </div>
        <Popover open={popOpen} onOpenChange={setPopOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Agregar reportes
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[420px] p-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Buscar por nombre o ID…"
                value={query}
                onValueChange={setQuery}
              />
              <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs text-muted-foreground">
                <span>
                  {selected.size} de {allReports.length} seleccionados
                </span>
                {selected.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <CommandList className="max-h-72">
                <CommandEmpty>
                  {isPending ? "Cargando…" : "No hay reportes."}
                </CommandEmpty>
                <CommandGroup>
                  {searchable.map((r) => {
                    const id = r.reportIdPB ?? "";
                    if (!id) return null;
                    const isSelected = selected.has(id);
                    return (
                      <CommandItem
                        key={id}
                        value={id}
                        onSelect={() => toggle(id)}
                        className="gap-2"
                      >
                        <Checkbox
                          checked={isSelected}
                          tabIndex={-1}
                          aria-hidden
                          className="pointer-events-none"
                        />
                        <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm">{r.name ?? "(sin nombre)"}</span>
                          <span className="truncate font-mono text-[10px] text-muted-foreground">
                            {id}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
              <div className="border-t border-border p-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setPopOpen(false)}
                >
                  Listo
                </Button>
              </div>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : assigned.length === 0 && orphans.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon asChild>
            <FileText />
          </EmptyStateIcon>
          <EmptyStateTitle>Sin reportes</EmptyStateTitle>
          <EmptyStateDescription>
            Asigná reportes al grupo para que sus miembros los puedan ver.
          </EmptyStateDescription>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {assigned.map((r) => {
            const id = r.reportIdPB ?? "";
            return (
              <li key={id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.name ?? "(sin nombre)"}</div>
                    <div className="truncate font-mono text-[10px] text-muted-foreground">
                      {id}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(id)}
                  aria-label={`Quitar ${r.name ?? id}`}
                >
                  <X className="size-4" />
                </Button>
              </li>
            );
          })}
          {orphans.map((id) => (
            <li
              key={id}
              className="flex items-center justify-between gap-3 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Reporte no encontrado</span>
                    <Badge variant="destructive" className="uppercase">
                      Huérfano
                    </Badge>
                  </div>
                  <div className="truncate font-mono text-[10px] text-muted-foreground">
                    {id}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:text-destructive"
                onClick={() => remove(id)}
                aria-label="Quitar"
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {dirty && (
        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button variant="ghost" size="sm" onClick={reset} disabled={update.isPending}>
            Cancelar cambios
          </Button>
          <Button size="sm" onClick={save} disabled={update.isPending} className="gap-1.5">
            {update.isPending ? "Guardando…" : (<><Check className="size-3.5" /> Guardar reportes</>)}
          </Button>
        </div>
      )}
    </div>
  );
}
