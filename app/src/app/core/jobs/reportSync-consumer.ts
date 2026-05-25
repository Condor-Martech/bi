import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { GroupsService } from '../../modules/groups/groups.service';
import { ReportsService } from '../../modules/reports/reports.service';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { EventsService } from '../../modules/events/events.service';
import type { ReportSyncJobData } from './reportSync-producer';

/**
 * Consumer de la cola `reportSyncQueue`.
 *
 * Responsabilidades:
 *  1. Ejecutar el sync de una cuenta Power BI (workspaces + reports vía Azure).
 *  2. Empujar eventos transitorios al SSE del usuario que disparó el sync
 *     (`sync.started`, `sync.progress`, `sync.completed`, `sync.failed`) —
 *     consumibles por el browser para actualizar toasts en tiempo real.
 *  3. Emitir eventos de auditoría (`account.sync_*`) vía EventsService para
 *     que queden persistidos en `user_events` por el listener correspondiente.
 *
 * Los pasos del sync son atómicos a nivel de Azure (`createAllGroupByAccount`
 * borra y recrea todos los groups de la cuenta antes de re-popularlos), así
 * que un fallo a mitad de camino deja la cuenta en estado vacío de groups —
 * el siguiente sync exitoso la repara. NO se hace rollback parcial.
 */
@Injectable()
@Processor('reportSyncQueue')
export class ReportSyncConsumer {
  private readonly logger = new Logger(ReportSyncConsumer.name);

  constructor(
    @Inject(forwardRef(() => GroupsService)) private readonly groupsService: GroupsService,
    @Inject(forwardRef(() => ReportsService)) private readonly reportsService: ReportsService,
    private readonly notifications: NotificationsService,
    private readonly events: EventsService,
  ) { }

  @Process('syncAccount')
  async syncAccount(job: Job<ReportSyncJobData>): Promise<void> {
    const { userID, accountID } = job.data;
    const jobId = String(job.id);

    this.notifications.pushTransient(userID, 'sync.started', { jobId, accountID });
    this.events.trackAccountSyncStarted({ userId: userID }, accountID);

    try {
      // Paso 1: recrear todos los workspaces de la cuenta vía Power BI.
      this.notifications.pushTransient(userID, 'sync.progress', {
        jobId,
        accountID,
        phase: 'workspaces',
        message: 'Sincronizando workspaces…',
      });
      await this.groupsService.createAllGroupByAccount(accountID);

      // Paso 2: traer los workspaces recién creados desde Mongo.
      const groupsResult = await this.groupsService.findAllByAccount(accountID);
      const groups = groupsResult?.groups ?? [];

      // Paso 3: por cada workspace, traer todos los reports desde Power BI.
      this.notifications.pushTransient(userID, 'sync.progress', {
        jobId,
        accountID,
        phase: 'reports',
        total: groups.length,
        message: `Sincronizando reports de ${groups.length} workspace(s)…`,
      });
      await this.reportsService.getAllReportsByGroup(groups as any[], accountID);

      // Conteo final (no es per-cuenta, es global — el endpoint legacy original
      // tampoco filtraba; mantenemos la métrica de "reports en el sistema").
      const all = await this.reportsService.findAll();
      const reportsCount = (all as any)?.reports?.length ?? (Array.isArray(all) ? all.length : 0);

      this.notifications.pushTransient(userID, 'sync.completed', {
        jobId,
        accountID,
        reportsCount,
        workspacesCount: groups.length,
      });
      this.events.trackAccountSyncCompleted({ userId: userID }, accountID, {
        reportsCount,
        workspacesCount: groups.length,
      });
    } catch (err) {
      const message = (err as Error)?.message ?? 'Sync failed';
      this.logger.error(`Sync failed for account ${accountID}: ${message}`, (err as Error)?.stack);

      this.notifications.pushTransient(userID, 'sync.failed', {
        jobId,
        accountID,
        error: message,
      });
      this.events.trackAccountSyncFailed({ userId: userID }, accountID, message);

      // Re-throw para que Bull marque el job como failed y respete attempts/backoff.
      throw err;
    }
  }

  @OnQueueActive()
  onActive(job: Job<ReportSyncJobData>) {
    this.logger.log(`Sync starting: account=${job.data.accountID} user=${job.data.userID} jobId=${job.id}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<ReportSyncJobData>) {
    this.logger.log(`Sync completed: account=${job.data.accountID} jobId=${job.id}`);
  }

  @OnQueueFailed()
  onFailed(job: Job<ReportSyncJobData>, err: Error) {
    this.logger.error(`Sync failed: account=${job.data?.accountID} jobId=${job?.id}: ${err.message}`);
  }
}
