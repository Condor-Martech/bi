"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Plus, Search, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useUpdateUserGroup } from "@/lib/hooks/user-groups";
import { useUsers } from "@/lib/hooks/users";

interface Props {
  group: UserGroup;
}

function initials(name?: string, email?: string) {
  const src = name?.trim() || email?.trim() || "?";
  return src
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function MembersSection({ group }: Props) {
  const { data: users = [], isPending } = useUsers();
  const update = useUpdateUserGroup();

  const initial = useMemo(() => new Set(group.users ?? []), [group.users]);
  const [selected, setSelected] = useState<Set<string>>(initial);
  const [query, setQuery] = useState("");
  const [popOpen, setPopOpen] = useState(false);

  useEffect(() => setSelected(new Set(group.users ?? [])), [group.users]);

  const dirty =
    selected.size !== initial.size ||
    [...selected].some((id) => !initial.has(id));

  const userById = useMemo(() => {
    const map = new Map<string, (typeof users)[number]>();
    for (const u of users) {
      const id = u._id ?? u.id;
      if (id) map.set(id, u);
    }
    return map;
  }, [users]);

  const members = [...selected]
    .map((id) => userById.get(id))
    .filter((u): u is (typeof users)[number] => Boolean(u));

  const memberIdsWithoutMatch = [...selected].filter((id) => !userById.has(id));

  const searchable = users.filter((u) => {
    const id = u._id ?? u.id;
    if (!id) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (u.name?.toLowerCase().includes(q) ?? false) ||
      (u.email?.toLowerCase().includes(q) ?? false)
    );
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
    setSelected(new Set(group.users ?? []));
  }
  function save() {
    if (selected.size === 0) {
      toast.error("El grupo necesita al menos un miembro.");
      return;
    }
    update.mutate(
      { id: group._id, body: { usersIds: [...selected] } },
      {
        onSuccess: () => toast.success("Miembros actualizados."),
        onError: (err) => toast.error((err as Error).message ?? "Error al guardar."),
      },
    );
  }

  return (
    <div className="space-y-4 rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Miembros del grupo</h2>
          <p className="text-xs text-muted-foreground">
            Los miembros heredan los reportes asignados al grupo.
          </p>
        </div>
        <Popover open={popOpen} onOpenChange={setPopOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <UserPlus className="size-3.5" />
              Agregar miembros
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[380px] p-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Buscar por nombre o email…"
                value={query}
                onValueChange={setQuery}
              />
              <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs text-muted-foreground">
                <span>
                  {selected.size} de {users.length} seleccionados
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
                  {isPending ? "Cargando…" : "No hay usuarios."}
                </CommandEmpty>
                <CommandGroup>
                  {searchable.map((u) => {
                    const id = u._id ?? u.id ?? "";
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
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">
                            {initials(u.name, u.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm">{u.name ?? u.email}</span>
                          {u.email && u.name && (
                            <span className="truncate text-xs text-muted-foreground">
                              {u.email}
                            </span>
                          )}
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
      ) : members.length === 0 && memberIdsWithoutMatch.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon asChild>
            <UserPlus />
          </EmptyStateIcon>
          <EmptyStateTitle>Sin miembros</EmptyStateTitle>
          <EmptyStateDescription>
            Agregá usuarios para que vean los reportes del grupo.
          </EmptyStateDescription>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {members.map((u) => {
            const id = u._id ?? u.id ?? "";
            return (
              <li key={id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {initials(u.name, u.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{u.name ?? "—"}</div>
                    <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  {u.role && (
                    <Badge variant="outline" className="ml-2 shrink-0 uppercase">
                      {u.role}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(id)}
                  aria-label={`Quitar ${u.name ?? u.email}`}
                >
                  <X className="size-4" />
                </Button>
              </li>
            );
          })}
          {memberIdsWithoutMatch.map((id) => (
            <li
              key={id}
              className="flex items-center justify-between gap-3 px-3 py-2 text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">??</AvatarFallback>
                </Avatar>
                <div className="font-mono text-xs">{id} (usuario no encontrado)</div>
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
            {update.isPending ? "Guardando…" : (<><Check className="size-3.5" /> Guardar miembros</>)}
          </Button>
        </div>
      )}
    </div>
  );
}
