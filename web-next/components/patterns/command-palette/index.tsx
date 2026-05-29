"use client";

import * as React from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  group?: string;
  keywords?: string[];
  onSelect: () => void | Promise<void>;
}

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
  register: (item: CommandPaletteItem) => void;
  unregister: (id: string) => void;
  items: ReadonlyMap<string, CommandPaletteItem>;
}

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(
  null,
);

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Map<string, CommandPaletteItem>>(
    () => new Map(),
  );

  const register = React.useCallback((item: CommandPaletteItem) => {
    setItems((prev) => {
      const next = new Map(prev);
      next.set(item.id, item);
      return next;
    });
  }, []);

  const unregister = React.useCallback((id: string) => {
    setItems((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggle = React.useCallback(() => setOpen((prev) => !prev), []);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = React.useMemo<CommandPaletteContextValue>(
    () => ({ open, setOpen, toggle, register, unregister, items }),
    [open, toggle, register, unregister, items],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const ctx = React.useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPalette deve ser usado dentro de <CommandPaletteProvider>",
    );
  }
  return ctx;
}

/**
 * Registra un command durante el mount del componente que llama.
 * El handler se mantiene actualizado vía ref para evitar re-registros en cada render.
 */
export function useRegisterCommand(item: CommandPaletteItem) {
  const ctx = React.useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useRegisterCommand deve ser usado dentro de <CommandPaletteProvider>",
    );
  }
  const handlerRef = React.useRef(item.onSelect);
  React.useEffect(() => {
    handlerRef.current = item.onSelect;
  }, [item.onSelect]);

  // Las arrays se aplanan a strings simples para el deps array.
  const shortcutKey = item.shortcut?.join("|");
  const keywordsKey = item.keywords?.join("|");
  const stableItem = React.useMemo<CommandPaletteItem>(
    () => ({
      ...item,
      onSelect: () => handlerRef.current(),
    }),
    // Re-registramos solo cuando cambian propiedades estables.
    // `onSelect` y `icon` (ReactNode) se ignoran a propósito — `icon` casi nunca
    // cambia, y `onSelect` se mantiene fresh vía ref. Si necesitás invalidar,
    // cambiá el id o el label.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.id, item.label, item.description, item.group, shortcutKey, keywordsKey],
  );

  React.useEffect(() => {
    ctx.register(stableItem);
    return () => ctx.unregister(stableItem.id);
  }, [ctx, stableItem]);
}

function CommandPalette() {
  const { open, setOpen, items } = useCommandPalette();

  const grouped = React.useMemo(() => {
    const map = new Map<string, CommandPaletteItem[]>();
    for (const item of items.values()) {
      const key = item.group ?? "General";
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Paleta de comandos"
      description="Pesquise e execute comandos. Atalho: ⌘K"
    >
      <CommandInput placeholder="O que você quer fazer?" />
      <CommandList>
        <CommandEmpty>Sem resultados.</CommandEmpty>
        {grouped.map(([group, groupItems], index) => (
          <React.Fragment key={group}>
            {index > 0 ? <CommandSeparator /> : null}
            <CommandGroup heading={group}>
              {groupItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.keywords?.join(" ") ?? ""}`}
                  onSelect={async () => {
                    setOpen(false);
                    await item.onSelect();
                  }}
                >
                  {item.icon}
                  <div className="flex flex-1 flex-col">
                    <span>{item.label}</span>
                    {item.description ? (
                      <span className="text-muted-foreground text-xs">
                        {item.description}
                      </span>
                    ) : null}
                  </div>
                  {item.shortcut?.length ? (
                    <CommandShortcut>{item.shortcut.join(" ")}</CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
