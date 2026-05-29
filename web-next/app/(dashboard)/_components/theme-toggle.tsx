"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  collapsed?: boolean;
}

type ThemeOption = {
  value: "light" | "dark" | "system";
  label: string;
  Icon: typeof Sun;
};

const OPTIONS: ReadonlyArray<ThemeOption> = [
  { value: "light", label: "Claro", Icon: Sun },
  { value: "dark", label: "Escuro", Icon: Moon },
  { value: "system", label: "Sistema", Icon: Monitor },
];

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2]!;
  const CurrentIcon = mounted
    ? resolvedTheme === "dark"
      ? Moon
      : Sun
    : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          title={collapsed ? "Tema" : undefined}
          aria-label="Alterar tema"
          className={cn(
            "text-sidebar-foreground/80",
            collapsed ? "h-8 w-8 justify-center p-0" : "w-full justify-start gap-2",
          )}
          suppressHydrationWarning
        >
          <CurrentIcon className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && (
            <span suppressHydrationWarning>{mounted ? current.label : "Tema"}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-36">
        {OPTIONS.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setTheme(value)}
            className={cn(
              "gap-2 text-sm",
              mounted && theme === value && "bg-accent text-accent-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
