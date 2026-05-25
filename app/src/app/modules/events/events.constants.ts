/**
 * Constantes y tipos del sistema de eventos / analytics interno.
 *
 * Diseño:
 * - USER_EVENT — evento único emitido vía @nestjs/event-emitter. El listener
 *   consume async, persiste en `user_events` y actualiza agregados (`report_visits`)
 *   cuando corresponde.
 * - EVENT_NAMES — taxonomía cerrada de eventos trackeables (Tier 1 + Tier 2 de v1).
 * - Tier 3 (audit de admin) vive en módulo `audit-log` separado, distinta retention.
 *
 * Reglas de emisión: emitir DESPUÉS de que la operación de negocio confirme
 * (ej. después del save de Mongo). Si la escritura del evento falla, NO debe
 * afectar el request del usuario (fire-and-forget en el listener con try/catch).
 */

export const USER_EVENT = 'user.event' as const;

export const EVENT_NAMES = {
  // Tier 1 — analytics de uso (lo que pidió el usuario)
  REPORT_VIEWED: 'report.viewed',
  REPORT_LIST_VIEWED: 'report.list_viewed',
  CUSTOM_REPORT_VIEWED: 'custom_report.viewed',
  NOTIFICATION_READ: 'notification.read',
  AUTH_LOGIN_SUCCESS: 'auth.login_success',
  AUTH_LOGOUT: 'auth.logout',
  FAVOURITE_ADDED: 'favourite.added',
  FAVOURITE_REMOVED: 'favourite.removed',

  // Tier 2 — alto valor, bajo esfuerzo
  AUTH_LOGIN_FAILED: 'auth.login_failed',
  AUTH_TOKEN_REFRESHED: 'auth.token_refreshed',
  AUTH_PASSWORD_RESET_REQUESTED: 'auth.password_reset_requested',
  AUTH_PASSWORD_RESET_COMPLETED: 'auth.password_reset_completed',
  REPORT_EXPORTED: 'report.exported',
  ACCOUNT_SYNC_STARTED: 'account.sync_started',
  ACCOUNT_SYNC_COMPLETED: 'account.sync_completed',
  ACCOUNT_SYNC_FAILED: 'account.sync_failed',
  ACCOUNT_AZURE_TOKEN_REFRESH_FAILED: 'account.azure_token_refresh_failed',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

export const RESOURCE_TYPES = {
  REPORT: 'report',
  CUSTOM_REPORT: 'custom_report',
  NOTIFICATION: 'notification',
  ACCOUNT: 'account',
  FAVOURITE: 'favourite',
  USER: 'user',
} as const;

export type ResourceType = (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];

/**
 * Contexto del actor — snapshot al momento del evento.
 * Se guarda email/role como snapshot para que el evento sobreviva cambios futuros
 * en el documento del usuario (mismo patrón que new-bi audit-log).
 */
export interface EventActor {
  userId?: string | null;
  email?: string | null;
  role?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface UserEventPayload {
  eventName: EventName;
  actor: EventActor;
  resourceType?: ResourceType | null;
  resourceId?: string | null;
  metadata?: Record<string, unknown> | null;
  at?: Date;
}

/**
 * Eventos que disparan agregación en `report_visits` (counter rápido para
 * queries de "top reports"). El listener detecta y hace upsert con $inc.
 */
export const VISIT_TRIGGER_EVENTS: ReadonlyArray<EventName> = [
  EVENT_NAMES.REPORT_VIEWED,
  EVENT_NAMES.CUSTOM_REPORT_VIEWED,
];
