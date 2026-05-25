"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Building2, ChevronRight, FileBarChart2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useMeSidebar } from "@/lib/hooks/me-sidebar";
import { durations, easings } from "@/lib/motion/transitions";
import { cn } from "@/lib/utils";

const OPEN_COOKIE = "bi_sidebar_open_accounts";

function toSentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

interface Props {
  collapsed: boolean;
  defaultOpenAccountIds: string[];
}

export function SidebarAccountsSection({ collapsed, defaultOpenAccountIds }: Props) {
  const pathname = usePathname();
  const { data, isLoading } = useMeSidebar();
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpenAccountIds));

  if (collapsed) return null;

  function toggle(accountId: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) next.delete(accountId);
      else next.add(accountId);
      document.cookie = `${OPEN_COOKIE}=${encodeURIComponent(Array.from(next).join(","))}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }

  return (
    <div className="space-y-1 p-2" aria-label="Minhas contas">
      <p className="px-2 text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
        Minhas contas
      </p>

      {isLoading ? (
        <div className="space-y-1 px-1">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
        </div>
      ) : !data || data.length === 0 ? (
        <p className="px-2 text-xs text-sidebar-foreground/60">Nenhuma conta disponível</p>
      ) : (
        <ul className="space-y-0.5">
          {data.map((account) => {
            const isOpen = open.has(account.id);
            return (
              <li key={account.id}>
                <button
                  type="button"
                  onClick={() => toggle(account.id)}
                  aria-expanded={isOpen}
                  className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 shrink-0 transition-transform duration-150",
                      isOpen && "rotate-90",
                    )}
                  />
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 truncate text-left uppercase">{account.name}</span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="workspaces-list"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: durations.base, ease: easings.standard }}
                      style={{ overflow: "hidden" }}
                    >
                      <ul className="mt-0.5 space-y-0.5 pl-5" aria-label={`Workspaces de ${account.name}`}>
                        {account.workspaces.length === 0 ? (
                          <li className="px-2 py-1 text-xs text-sidebar-foreground/50">
                            Nenhum workspace
                          </li>
                        ) : (
                          account.workspaces.map((ws) => {
                            const href = `/workspaces/${encodeURIComponent(ws.pbWorkspaceId)}?name=${encodeURIComponent(ws.name)}`;
                            const active = pathname === `/workspaces/${ws.pbWorkspaceId}`;
                            return (
                              <li key={ws.id}>
                                <Link
                                  href={href}
                                  aria-current={active ? "page" : undefined}
                                  className={cn(
                                    "flex h-7 items-center gap-2 rounded-md px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    active
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  )}
                                >
                                  <FileBarChart2 className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{toSentenceCase(ws.name)}</span>
                                </Link>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
