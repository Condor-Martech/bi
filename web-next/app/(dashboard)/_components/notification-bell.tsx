"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { Bell, BellOff, Loader2, Trash2 } from "lucide-react";

import { MotionList } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MotionBadgeCounter } from "@/components/ui/_motion/motion-badge-counter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useDeleteNotification,
  useMarkAsRead,
  useNotifications,
} from "@/lib/hooks/notifications";
import type { Notification } from "@/lib/api/endpoints/notifications";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

/**
 * Bell icon in the dashboard header. Shows unread count as a badge, and a
 * popover with the latest notifications (most recent first).
 *
 * Behaviors:
 * - Unread items get a colored dot + bolder title.
 * - Clicking an unread item marks it as read (optimistically).
 * - The "Marcar todas como leídas" action only appears if there is at least
 *   one unread visible — it fires a serial PATCH per item.
 *
 * The bell does NOT mount the SSE stream; that lives at the dashboard root
 * (see `notification-stream-mount.tsx`) so the popover open/close cycle
 * doesn't tear the stream down.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useNotifications(1, PAGE_SIZE);
  const markAsRead = useMarkAsRead();
  const deleteOne = useDeleteNotification();

  const items = data?.data ?? [];
  const unread = data?.meta.unread ?? 0;

  const unreadItems = useMemo(() => items.filter((i) => !i.readme), [items]);

  // Shake on new notification — detecta delta positivo en unread count
  // y dispara una animación imperativa (sin setState in effect).
  const reduceMotion = useReducedMotion();
  const previousUnreadRef = useRef(unread);
  const [bellScope, animateBell] = useAnimate<HTMLSpanElement>();
  useEffect(() => {
    if (
      unread > previousUnreadRef.current &&
      !reduceMotion &&
      bellScope.current
    ) {
      void animateBell(
        bellScope.current,
        { rotate: [0, -10, 10, -6, 6, 0] },
        { duration: 0.4 },
      );
    }
    previousUnreadRef.current = unread;
  }, [unread, reduceMotion, animateBell, bellScope]);

  function onItemClick(n: Notification) {
    if (n.readme) return;
    markAsRead.mutate(n);
  }

  async function markAllVisibleAsRead() {
    for (const n of unreadItems) {
      // Serial — the legacy doesn't expose a bulk endpoint, and parallel
      // PATCHes would race the cache snapshot logic in the mutation.
      await markAsRead.mutateAsync(n);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notificaciones"
          className="relative h-8 w-8 text-sidebar-foreground/80 hover:text-sidebar-foreground"
        >
          <span ref={bellScope} className="inline-flex">
            <Bell className="h-4 w-4" />
          </span>
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full p-0 px-1 text-[10px] leading-none"
            >
              <MotionBadgeCounter count={unread} />
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="text-sm font-medium">Notificaciones</div>
          {unreadItems.length > 0 && (
            <button
              type="button"
              onClick={markAllVisibleAsRead}
              disabled={markAsRead.isPending}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {markAsRead.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Marcar como leídas"
              )}
            </button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
              Cargando…
            </div>
          ) : isError ? (
            <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
              No se pudieron cargar las notificaciones.
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <BellOff className="h-5 w-5" />
              Sin notificaciones todavía.
            </div>
          ) : (
            <MotionList
              items={items}
              getItemKey={(n) => n._id}
              className="divide-y divide-border"
              itemClassName="group relative"
              renderItem={(n) => (
                <div
                  onClick={() => onItemClick(n)}
                  className={cn(
                    "cursor-pointer px-3 py-2.5 transition-colors hover:bg-muted/50",
                    !n.readme && "bg-muted/30",
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.readme && (
                      <span
                        aria-label="No leída"
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "truncate text-sm",
                          !n.readme ? "font-medium text-foreground" : "text-foreground/80",
                        )}
                      >
                        {n.title}
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.message}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                        {n.createdAt ? formatRelative(n.createdAt) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOne.mutate(n._id);
                      }}
                      aria-label="Eliminar notificación"
                      className="ml-2 hidden h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground group-hover:flex"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            />
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Tiny relative-time formatter — avoids adding `date-fns` for one helper.
 * Outputs "hace 2 min", "hace 3 h", "hace 5 d", or the ISO date if older than 30d.
 */
function formatRelative(input: string | Date): string {
  try {
    const d = typeof input === "string" ? new Date(input) : input;
    const diff = Date.now() - d.getTime();
    if (Number.isNaN(diff)) return "";
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return "ahora";
    const min = Math.floor(sec / 60);
    if (min < 60) return `hace ${min} min`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `hace ${hr} h`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `hace ${day} d`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}
