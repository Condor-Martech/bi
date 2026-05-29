"use client";

import { useState } from "react";
import { Bell, Check, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { MotionList } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Notification } from "@/lib/api/endpoints/notifications";
import {
  useDeleteNotification,
  useMarkAsRead,
  useNotifications,
} from "@/lib/hooks/notifications";

import { DeleteConfirm } from "../users/_components/delete-confirm";

const LIMIT = 20;

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, error } = useNotifications(page, LIMIT);
  const markRead = useMarkAsRead();
  const del = useDeleteNotification();

  const [deleteTarget, setDeleteTarget] = useState<Notification | undefined>(undefined);

  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  function onMark(n: Notification) {
    if (n.readme) return;
    markRead.mutate(n, {
      onError: (err) => toast.error((err as Error).message ?? "Não foi possível marcar como lida."),
    });
  }

  function confirmDelete(n: Notification) {
    del.mutate(n._id, {
      onSuccess: () => {
        toast.success("Notificação excluída.");
        setDeleteTarget(undefined);
      },
      onError: (err) => toast.error((err as Error).message ?? "Não foi possível excluir."),
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notificações</h1>
          <p className="text-sm text-muted-foreground">
            Histórico de notificações recebidas. As novas chegam em tempo real via SSE.
          </p>
        </div>
        {meta && (
          <Badge variant="secondary" className="font-mono">
            {meta.unread} não lidas / {meta.total}
          </Badge>
        )}
      </header>

      {error && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-destructive">
            Error: {(error as Error).message}
          </CardContent>
        </Card>
      )}

      {isPending && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!isPending && !error && items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Bell className="size-6" />
            Não há notificações.
          </CardContent>
        </Card>
      )}

      <MotionList
        items={items}
        getItemKey={(n) => n._id}
        className="space-y-2"
        renderItem={(n) => (
          <Card
            className={
              n.readme
                ? "border-border"
                : "border-twenty-blue/40 bg-twenty-blue/[0.04]"
            }
          >
            <CardContent className="flex items-start gap-3 p-4">
              <div className="mt-0.5">
                <Bell
                  className={`size-4 ${
                    n.readme ? "text-muted-foreground" : "text-twenty-blue"
                  }`}
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  {!n.readme && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      novo
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                {n.createdAt && (
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {typeof n.createdAt === "string"
                      ? new Date(n.createdAt).toLocaleString("pt-BR")
                      : n.createdAt.toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!n.readme && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMark(n)}
                    disabled={markRead.isPending}
                    aria-label="Marcar como lida"
                    className="size-8"
                  >
                    <Check className="size-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(n)}
                  aria-label="Excluir"
                  className="size-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      />

      {meta && totalPages > 1 && (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-between border-t border-border pt-3 text-sm"
        >
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="gap-1"
          >
            <ChevronLeft className="size-3.5" />
            Anterior
          </Button>
          <span className="font-mono text-xs text-muted-foreground">
            Página {meta.page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="gap-1"
          >
            Próxima
            <ChevronRight className="size-3.5" />
          </Button>
        </nav>
      )}

      <DeleteConfirm
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(undefined);
        }}
        title="Excluir esta notificação?"
        description={`"${deleteTarget?.title ?? ""}" será excluída permanentemente.`}
        onConfirm={() => deleteTarget && confirmDelete(deleteTarget)}
        isPending={del.isPending}
      />
    </div>
  );
}
