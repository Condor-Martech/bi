import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EventsListener } from './events.listener';
import { EventsService } from './events.service';
import { ReportVisit, ReportVisitSchema } from './report-visit.entity';
import { UserEvent, UserEventSchema } from './user-event.entity';

/**
 * Módulo de eventos / analytics.
 *
 * `@Global()` porque los services del dominio (reports, notifications, etc.) lo
 * inyectan para emitir, y registrarlo manualmente en cada module sería ruido.
 * Mismo criterio que CacheService y AccountsService en este repo.
 *
 * En v1 NO expone controller — los endpoints de analytics (top reports,
 * last logins, etc.) entran en PR posterior. La emisión ya funciona desde acá.
 */
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEvent.name, schema: UserEventSchema },
      { name: ReportVisit.name, schema: ReportVisitSchema },
    ]),
  ],
  providers: [EventsService, EventsListener],
  exports: [EventsService],
})
export class EventsModule {}
