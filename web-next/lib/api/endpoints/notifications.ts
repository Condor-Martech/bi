import { z } from "zod";

/**
 * Schemas + types + query keys for the `/notifications` module.
 *
 * Reference:
 *   - DTO: legacy/app/.../dto/create-notification.dto.ts
 *   - Entity: legacy/app/.../entities/notification.entity.ts
 *
 * Important field semantics:
 *   - `readme` (sic) is the boolean "already read" flag — the legacy name comes
 *     from a typo we keep on purpose to match the wire shape exactly.
 *   - `userID` is the recipient's user id (ObjectId hex).
 *   - `createdAt`/`updatedAt` are mongoose timestamps, serialized as ISO strings.
 */

export const notificationSchema = z
  .object({
    _id: z.string(),
    title: z.string(),
    message: z.string(),
    userID: z.string(),
    readme: z.boolean().default(false),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export type Notification = z.infer<typeof notificationSchema>;

/** Shape of `GET /notifications?page=&limit=` (see notifications.service.findAllForUser). */
export const notificationPageSchema = z.object({
  data: z.array(notificationSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    unread: z.number(),
  }),
});

export type NotificationPage = z.infer<typeof notificationPageSchema>;

/**
 * Sync job event payloads — pushed by the legacy `ReportSyncConsumer` via
 * `NotificationsService.pushTransient` (NOT persisted in Mongo). Used to drive
 * toast lifecycle in the UI without polling. See `reportSync-consumer.ts`.
 */
export const syncStartedSchema = z.object({
  jobId: z.string(),
  accountID: z.string(),
});

export const syncProgressSchema = z.object({
  jobId: z.string(),
  accountID: z.string(),
  phase: z.string().optional(),
  current: z.number().optional(),
  total: z.number().optional(),
  message: z.string().optional(),
});

export const syncCompletedSchema = z.object({
  jobId: z.string(),
  accountID: z.string(),
  reportsCount: z.number().optional(),
  workspacesCount: z.number().optional(),
});

export const syncFailedSchema = z.object({
  jobId: z.string(),
  accountID: z.string(),
  error: z.string(),
});

/** SSE event payloads — `notification` is persisted; `sync.*` are ephemeral; `ping` is heartbeat. */
export const sseEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("notification"),
    data: notificationSchema,
  }),
  z.object({
    type: z.literal("ping"),
    data: z.object({ ts: z.string() }).passthrough(),
  }),
  z.object({
    type: z.literal("sync.started"),
    data: syncStartedSchema,
  }),
  z.object({
    type: z.literal("sync.progress"),
    data: syncProgressSchema,
  }),
  z.object({
    type: z.literal("sync.completed"),
    data: syncCompletedSchema,
  }),
  z.object({
    type: z.literal("sync.failed"),
    data: syncFailedSchema,
  }),
]);

export type SseEvent = z.infer<typeof sseEventSchema>;
export type SyncEvent = Extract<SseEvent, { type: `sync.${string}` }>;

/** Body of `POST /notifications` (MANAGER-only broadcast). */
export interface CreateNotificationBody {
  title: string;
  message: string;
}

export const notificationsKeys = {
  all: ["notifications"] as const,
  list: (page: number, limit: number) =>
    [...notificationsKeys.all, "list", { page, limit }] as const,
} as const;
