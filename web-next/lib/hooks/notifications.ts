"use client";

import { useEffect } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import {
  notificationPageSchema,
  notificationSchema,
  notificationsKeys,
  sseEventSchema,
  syncCompletedSchema,
  syncFailedSchema,
  syncProgressSchema,
  syncStartedSchema,
  type CreateNotificationBody,
  type Notification,
  type NotificationPage,
} from "@/lib/api/endpoints/notifications";
import { publishSyncEvent } from "@/lib/hooks/sync-events";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/**
 * GET /notifications — paginated list for the current user.
 *
 * The legacy returns `{ data, meta: { page, limit, total, unread } }`. We
 * surface `unread` to the bell badge without a second query.
 */
export function useNotifications(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
  return useQuery<NotificationPage>({
    queryKey: notificationsKeys.list(page, limit),
    queryFn: async () => {
      const data = await apiClient(`/api/notifications?page=${page}&limit=${limit}`);
      return notificationPageSchema.parse(data);
    },
    // Notifications are pushed by SSE; we don't need aggressive polling.
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}

/**
 * PATCH /notifications/:notifId/user/:userId — mark a single notification as read.
 *
 * The legacy controller route is `Patch(':notificationId/user/:userId')`. The
 * service enforces ownership via `{ _id, userID }` filter, so passing the wrong
 * userId silently yields 404. We pass the recipient's own id from the doc.
 */
export function useMarkAsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (n: Notification) => {
      const data = await apiClient(
        `/api/notifications/${encodeURIComponent(n._id)}/user/${encodeURIComponent(n.userID)}`,
        { method: "PATCH" },
      );
      return notificationSchema.parse(data);
    },
    onMutate: async (n) => {
      await qc.cancelQueries({ queryKey: notificationsKeys.all });
      // Optimistic update across every cached page.
      const snapshots = qc.getQueriesData<NotificationPage>({
        queryKey: notificationsKeys.all,
      });
      for (const [key, snapshot] of snapshots) {
        if (!snapshot) continue;
        const wasUnread = snapshot.data.some((d) => d._id === n._id && !d.readme);
        qc.setQueryData<NotificationPage>(key, {
          ...snapshot,
          data: snapshot.data.map((d) => (d._id === n._id ? { ...d, readme: true } : d)),
          meta: {
            ...snapshot.meta,
            unread: Math.max(0, snapshot.meta.unread - (wasUnread ? 1 : 0)),
          },
        });
      }
      return { snapshots };
    },
    onError: (_err, _n, ctx) => {
      if (!ctx?.snapshots) return;
      for (const [key, snapshot] of ctx.snapshots) {
        qc.setQueryData(key, snapshot);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

/** DELETE /notifications/:id */
export function useDeleteNotification() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`/api/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });
      return { id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

/** POST /notifications — MANAGER-only broadcast. */
export function useBroadcastNotification() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateNotificationBody) => {
      return apiClient<{ message: string }>("/api/notifications", {
        method: "POST",
        body,
      });
    },
    onSuccess: () => {
      // The MANAGER also receives the broadcast (they're a user too); the SSE
      // event will trigger an invalidation, but doing it explicitly avoids
      // any race where the toast appears before the list updates.
      qc.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

/**
 * Mount the SSE notification stream for the duration of the component lifecycle.
 *
 * - Connects to OUR `/api/notifications/stream` (same origin, httpOnly cookie
 *   sent automatically; the JWT is injected server-side into the upstream URL).
 * - Native `EventSource` handles auto-reconnect with exponential-ish backoff on
 *   transient errors. We do NOT roll our own reconnect logic.
 * - On `notification` event: validate with Zod, invalidate the cache, toast.
 * - On `ping` heartbeat: silent — used only to keep proxies from killing the
 *   connection (legacy emits one every 25s).
 *
 * Mount this exactly ONCE per session — at the dashboard root, NOT in the
 * notification bell. The bell can come and go (popover open/close) but the
 * stream should stay alive.
 */
export function useNotificationStream(enabled = true): void {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const es = new EventSource("/api/notifications/stream", {
      // Same-origin → cookies are sent automatically; no `withCredentials` needed.
      // (Setting it to true would force CORS preflight on cross-origin only.)
    });

    const onMessage = () => {
      // Legacy SSE uses named events (`event: notification`, `event: ping`).
      // Unnamed `message` events shouldn't happen in our protocol, but ignore
      // them defensively rather than crash.
    };

    const onNotification = (e: MessageEvent<string>) => {
      try {
        const parsed = sseEventSchema.parse({
          type: "notification",
          data: JSON.parse(e.data),
        });
        if (parsed.type !== "notification") return;
        qc.invalidateQueries({ queryKey: notificationsKeys.all });
        toast.message(parsed.data.title, {
          description: parsed.data.message,
        });
      } catch {
        // Malformed payload — swallow to keep the stream alive.
      }
    };

    const onPing = () => {
      // Heartbeat — nothing to do.
    };

    const onError = () => {
      // EventSource auto-reconnects. Surfacing transient errors as toasts
      // would be noisy on every page nav / network blip — keep it silent.
    };

    /**
     * Eventos ephemeral del worker de sync. NO se persisten en Mongo ni aparecen
     * en el bell — los consume el bus `sync-events` para drivear toasts en el page.
     */
    const makeSyncHandler = <T extends "sync.started" | "sync.progress" | "sync.completed" | "sync.failed">(
      type: T,
      schema: { parse: (val: unknown) => unknown },
    ) => (e: MessageEvent<string>) => {
      try {
        const data = schema.parse(JSON.parse(e.data));
        publishSyncEvent({ type, data } as never);
      } catch {
        // Malformed payload — swallow to keep the stream alive.
      }
    };

    const onSyncStarted = makeSyncHandler("sync.started", syncStartedSchema);
    const onSyncProgress = makeSyncHandler("sync.progress", syncProgressSchema);
    const onSyncCompleted = makeSyncHandler("sync.completed", syncCompletedSchema);
    const onSyncFailed = makeSyncHandler("sync.failed", syncFailedSchema);

    es.addEventListener("message", onMessage);
    es.addEventListener("notification", onNotification as EventListener);
    es.addEventListener("ping", onPing as EventListener);
    es.addEventListener("sync.started", onSyncStarted as EventListener);
    es.addEventListener("sync.progress", onSyncProgress as EventListener);
    es.addEventListener("sync.completed", onSyncCompleted as EventListener);
    es.addEventListener("sync.failed", onSyncFailed as EventListener);
    es.addEventListener("error", onError);

    return () => {
      es.removeEventListener("message", onMessage);
      es.removeEventListener("notification", onNotification as EventListener);
      es.removeEventListener("ping", onPing as EventListener);
      es.removeEventListener("sync.started", onSyncStarted as EventListener);
      es.removeEventListener("sync.progress", onSyncProgress as EventListener);
      es.removeEventListener("sync.completed", onSyncCompleted as EventListener);
      es.removeEventListener("sync.failed", onSyncFailed as EventListener);
      es.removeEventListener("error", onError);
      es.close(); // closes the upstream via signal forwarding in our route handler.
    };
  }, [enabled, qc]);
}
