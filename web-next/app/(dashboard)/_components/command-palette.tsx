"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Building2,
  History,
  Inbox,
  KeyRound,
  LogOut,
  Moon,
  Settings,
  Sun,
  Users,
  UsersRound,
} from "lucide-react";

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
import { apiClient } from "@/lib/api/client";

interface Props {
  isPrivileged: boolean;
}

/**
 * Global ⌘K / Ctrl+K palette. Mounted once at the dashboard layout level.
 *
 * `isPrivileged` is resolved server-side from the JWT role; we don't trust
 * client-side state for menu visibility.
 */
export function CommandPalette({ isPrivileged }: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  async function logout() {
    setOpen(false);
    try {
      await apiClient("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command palette" description="Navegação e ações rápidas">
      <CommandInput placeholder="Pesquisar página ou ação…" />
      <CommandList>
        <CommandEmpty>Sem resultados.</CommandEmpty>

        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => go("/notifications")}>
            <Inbox className="size-3.5" />
            <span>Notificações</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/configuracao/perfil")}>
            <Settings className="size-3.5" />
            <span>Perfil</span>
          </CommandItem>
        </CommandGroup>

        {isPrivileged && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Administração">
              <CommandItem onSelect={() => go("/users")}>
                <Users className="size-3.5" />
                <span>Usuários</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/grupos")}>
                <UsersRound className="size-3.5" />
                <span>Grupos</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/accounts")}>
                <Building2 className="size-3.5" />
                <span>Contas BI</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/login-log")}>
                <History className="size-3.5" />
                <span>Auditoria de logins</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Ações">
          <CommandItem onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            <span>Mudar para tema {theme === "dark" ? "claro" : "escuro"}</span>
            <CommandShortcut>T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/configuracao/perfil")}>
            <KeyRound className="size-3.5" />
            <span>Alterar senha</span>
          </CommandItem>
          <CommandItem onSelect={logout}>
            <LogOut className="size-3.5" />
            <span>Sair</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
