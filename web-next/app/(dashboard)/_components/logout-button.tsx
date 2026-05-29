"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  collapsed?: boolean;
}

export function LogoutButton({ collapsed = false }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      try {
        await apiClient("/api/auth/logout", { method: "POST" });
        router.replace("/login");
        router.refresh();
      } catch {
        toast.error("Não foi possível sair.");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={isPending}
      title={collapsed ? "Sair" : undefined}
      aria-label={collapsed ? "Sair" : undefined}
      className={cn(
        "text-sidebar-foreground/80",
        collapsed ? "h-8 w-8 justify-center p-0" : "w-full justify-start gap-2",
      )}
    >
      <LogOut className="h-3.5 w-3.5 shrink-0" />
      {!collapsed && <span>{isPending ? "Saindo…" : "Sair"}</span>}
    </Button>
  );
}
