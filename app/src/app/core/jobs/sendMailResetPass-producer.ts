import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { JobOptions, Queue } from "bull";

const RESET_JOB_OPTIONS: JobOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: true,
    removeOnFail: { age: 86_400 },
};

@Injectable()
export class SendMailResetProducer {
    private readonly logger = new Logger(SendMailResetProducer.name);

    constructor(@InjectQueue('sendMailResetQueue') private queue: Queue) { }

    async sendMailResetPass(data: any) {
        const job = await this.queue.add('sendMailResetJob', data, RESET_JOB_OPTIONS);
        this.logger.log(`Reset enfileirado jobId=${job.id} email=${data?.email}`);
        return job;
    }

}
