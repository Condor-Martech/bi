import { Queue } from "bull";
import { BullAdapter, ExpressAdapter, createBullBoard } from '@bull-board/express';
import { Inject, MiddlewareConsumer, Module, NestModule, forwardRef } from "@nestjs/common";
import { BullModule, getQueueToken } from "@nestjs/bull";
import { SendMailWelcomeConsumer } from './sendMailWelcome-consumer';
import { SendMailWelcomeProducer } from './sendMailWelcome-producer';
import { SendMailResetConsumer } from './sendMailResetPass-consumer';
import { SendMailResetProducer } from './sendMailResetPass-producer';
import { ReportSyncConsumer } from './reportSync-consumer';
import { ReportSyncProducer } from './reportSync-producer';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { ReportsModule } from '../../modules/reports/reports.module';


@Module({
    imports: [
        BullModule.registerQueue({
            name: 'sendMailWelcomeQueue',
        }),
        BullModule.registerQueue({
            name: 'sendMailResetQueue',
        }),
        BullModule.registerQueue({
            name: 'reportSyncQueue',
        }),
        // NotificationsModule expone `NotificationsService` (pushTransient para SSE).
        // ReportsModule expone `ReportsService` (consumer lo usa). `forwardRef` porque
        // ReportsController inyecta `ReportSyncProducer` del lado opuesto del grafo.
        NotificationsModule,
        forwardRef(() => ReportsModule),
        // GroupsService y EventsService llegan vía @Global() de sus modules.
    ],
    providers: [
        SendMailWelcomeConsumer,
        SendMailWelcomeProducer,
        SendMailResetConsumer,
        SendMailResetProducer,
        ReportSyncConsumer,
        ReportSyncProducer,

    ],
    exports: [
        SendMailWelcomeProducer,
        SendMailResetProducer,
        ReportSyncProducer,
    ]

})
export class JobModule implements NestModule {
    @Inject(getQueueToken('sendMailWelcomeQueue')) private readonly queueEmail: Queue;
    @Inject(getQueueToken('sendMailResetQueue')) private readonly queueReset: Queue;
    @Inject(getQueueToken('reportSyncQueue')) private readonly queueReportSync: Queue;

    configure(consumer: MiddlewareConsumer) {
        const serverAdapter = new ExpressAdapter()
        const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard(
            {
                queues: [
                    new BullAdapter(this.queueEmail),
                    new BullAdapter(this.queueReset),
                    new BullAdapter(this.queueReportSync),
                ],
                serverAdapter,
            },
        )
        serverAdapter.setBasePath('/admin/queues')
        consumer.apply(serverAdapter.getRouter()).forRoutes('/admin/queues');
    }
}


