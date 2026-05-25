import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model } from 'mongoose';

import {
  EVENT_NAMES,
  EventActor,
  EventName,
  RESOURCE_TYPES,
  ResourceType,
  USER_EVENT,
  UserEventPayload,
  VISIT_TRIGGER_EVENTS,
} from './events.constants';
import { ReportVisit, ReportVisitDocument } from './report-visit.entity';
import { UserEvent, UserEventDocument } from './user-event.entity';

/**
 * Servicio de eventos / analytics.
 *
 * Tiene dos roles:
 * 1. **Helpers de emisión** (`track*`) — fachada amigable sobre eventEmitter.emit().
 *    Los services del dominio (reports, notifications, etc.) llaman estos helpers
 *    en lugar de armar el payload a mano.
 * 2. **Persistencia** (`recordEvent`, `incrementVisit`) — usado por el listener
 *    para escribir a Mongo. NO llamar desde services del dominio (rompe el patrón
 *    fire-and-forget).
 *
 * La emisión es síncrona pero el listener consume async — si la persistencia falla,
 * NO afecta el request del usuario.
 */
@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectModel(UserEvent.name) private readonly userEventModel: Model<UserEventDocument>,
    @InjectModel(ReportVisit.name) private readonly reportVisitModel: Model<ReportVisitDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── Emisión (llamado por services del dominio) ───────────────────────────

  /**
   * Emite un evento genérico. Preferir helpers específicos cuando existan.
   * Fire-and-forget — nunca tira para arriba.
   */
  emit(payload: UserEventPayload): void {
    try {
      this.eventEmitter.emit(USER_EVENT, payload);
    } catch (err) {
      this.logger.warn(`Failed to emit ${payload.eventName}: ${(err as Error).message}`);
    }
  }

  trackReportView(actor: EventActor, reportIdPB: string, metadata?: Record<string, unknown>): void {
    this.emit({
      eventName: EVENT_NAMES.REPORT_VIEWED,
      actor,
      resourceType: RESOURCE_TYPES.REPORT,
      resourceId: reportIdPB,
      metadata,
    });
  }

  trackCustomReportView(actor: EventActor, customReportId: string, metadata?: Record<string, unknown>): void {
    this.emit({
      eventName: EVENT_NAMES.CUSTOM_REPORT_VIEWED,
      actor,
      resourceType: RESOURCE_TYPES.CUSTOM_REPORT,
      resourceId: customReportId,
      metadata,
    });
  }

  trackNotificationRead(actor: EventActor, notificationId: string): void {
    this.emit({
      eventName: EVENT_NAMES.NOTIFICATION_READ,
      actor,
      resourceType: RESOURCE_TYPES.NOTIFICATION,
      resourceId: notificationId,
    });
  }

  trackLoginSuccess(actor: EventActor): void {
    this.emit({ eventName: EVENT_NAMES.AUTH_LOGIN_SUCCESS, actor });
  }

  trackLoginFailed(actor: EventActor, reason: string): void {
    this.emit({
      eventName: EVENT_NAMES.AUTH_LOGIN_FAILED,
      actor,
      metadata: { reason },
    });
  }

  trackLogout(actor: EventActor): void {
    this.emit({ eventName: EVENT_NAMES.AUTH_LOGOUT, actor });
  }

  trackTokenRefreshed(actor: EventActor): void {
    this.emit({ eventName: EVENT_NAMES.AUTH_TOKEN_REFRESHED, actor });
  }

  trackPasswordResetRequested(actor: EventActor): void {
    this.emit({ eventName: EVENT_NAMES.AUTH_PASSWORD_RESET_REQUESTED, actor });
  }

  trackPasswordResetCompleted(actor: EventActor): void {
    this.emit({ eventName: EVENT_NAMES.AUTH_PASSWORD_RESET_COMPLETED, actor });
  }

  trackFavouriteAdded(actor: EventActor, reportIdPB: string): void {
    this.emit({
      eventName: EVENT_NAMES.FAVOURITE_ADDED,
      actor,
      resourceType: RESOURCE_TYPES.REPORT,
      resourceId: reportIdPB,
    });
  }

  trackFavouriteRemoved(actor: EventActor, reportIdPB: string): void {
    this.emit({
      eventName: EVENT_NAMES.FAVOURITE_REMOVED,
      actor,
      resourceType: RESOURCE_TYPES.REPORT,
      resourceId: reportIdPB,
    });
  }

  trackReportExported(actor: EventActor, reportIdPB: string, format: string): void {
    this.emit({
      eventName: EVENT_NAMES.REPORT_EXPORTED,
      actor,
      resourceType: RESOURCE_TYPES.REPORT,
      resourceId: reportIdPB,
      metadata: { format },
    });
  }

  trackAccountSyncStarted(actor: EventActor, accountId: string): void {
    this.emit({
      eventName: EVENT_NAMES.ACCOUNT_SYNC_STARTED,
      actor,
      resourceType: RESOURCE_TYPES.ACCOUNT,
      resourceId: accountId,
    });
  }

  trackAccountSyncCompleted(actor: EventActor, accountId: string, stats?: Record<string, unknown>): void {
    this.emit({
      eventName: EVENT_NAMES.ACCOUNT_SYNC_COMPLETED,
      actor,
      resourceType: RESOURCE_TYPES.ACCOUNT,
      resourceId: accountId,
      metadata: stats,
    });
  }

  trackAccountSyncFailed(actor: EventActor, accountId: string, error: string): void {
    this.emit({
      eventName: EVENT_NAMES.ACCOUNT_SYNC_FAILED,
      actor,
      resourceType: RESOURCE_TYPES.ACCOUNT,
      resourceId: accountId,
      metadata: { error },
    });
  }

  trackAzureTokenRefreshFailed(actor: EventActor, accountId: string, error: string): void {
    this.emit({
      eventName: EVENT_NAMES.ACCOUNT_AZURE_TOKEN_REFRESH_FAILED,
      actor,
      resourceType: RESOURCE_TYPES.ACCOUNT,
      resourceId: accountId,
      metadata: { error },
    });
  }

  // ─── Persistencia (llamado por el listener) ──────────────────────────────

  /**
   * Inserta un documento en `user_events`. Llamado por el listener — no
   * usar directamente desde services del dominio.
   */
  async recordEvent(payload: UserEventPayload): Promise<void> {
    const doc = new this.userEventModel({
      eventName: payload.eventName,
      userId: payload.actor.userId || undefined,
      userEmail: payload.actor.email || undefined,
      userRole: payload.actor.role || undefined,
      resourceType: payload.resourceType || undefined,
      resourceId: payload.resourceId || undefined,
      metadata: payload.metadata || undefined,
      ipAddress: payload.actor.ipAddress || undefined,
      userAgent: payload.actor.userAgent || undefined,
    });
    await doc.save();
  }

  /**
   * Upsert atómico en `report_visits`. Solo aplica para eventos en
   * `VISIT_TRIGGER_EVENTS`.
   */
  async incrementVisit(payload: UserEventPayload): Promise<void> {
    if (!payload.actor.userId || !payload.resourceId || !payload.resourceType) return;
    if (!this.isVisitTrigger(payload.eventName)) return;

    const now = payload.at || new Date();
    await this.reportVisitModel.updateOne(
      {
        userId: payload.actor.userId,
        reportIdPB: payload.resourceId,
        resourceType: payload.resourceType,
      },
      {
        $inc: { visitCount: 1 },
        $set: { lastVisitedAt: now },
        $setOnInsert: { firstVisitedAt: now },
      },
      { upsert: true },
    );
  }

  private isVisitTrigger(name: EventName): boolean {
    return VISIT_TRIGGER_EVENTS.includes(name);
  }
}
