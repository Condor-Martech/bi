import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { USER_EVENT, UserEventPayload } from './events.constants';
import { EventsService } from './events.service';

/**
 * Consumidor async de eventos USER_EVENT.
 *
 * Patrón: fire-and-forget. Si la persistencia falla, logueamos y seguimos —
 * NUNCA tiramos para arriba (los services del dominio no deben verse afectados).
 *
 * Equivalente al patrón new-bi audit-log.listener.ts.
 */
@Injectable()
export class EventsListener {
  private readonly logger = new Logger(EventsListener.name);

  constructor(private readonly service: EventsService) {}

  @OnEvent(USER_EVENT, { async: true })
  async onUserEvent(payload: UserEventPayload): Promise<void> {
    try {
      await this.service.recordEvent(payload);
    } catch (err) {
      this.logger.error(
        `Failed to persist user_event "${payload.eventName}": ${(err as Error).message}`,
      );
    }

    try {
      await this.service.incrementVisit(payload);
    } catch (err) {
      this.logger.error(
        `Failed to upsert report_visit for "${payload.eventName}" ${payload.resourceId}: ${(err as Error).message}`,
      );
    }
  }
}
