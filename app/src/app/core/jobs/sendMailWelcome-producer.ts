import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { JobOptions, Queue } from "bull";

export interface WelcomeJobData {
    name: string;
    email: string;
    /** Token de convite cru — viaja só no email, nunca em logs. */
    token: string;
}

const WELCOME_JOB_OPTIONS: JobOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: true,
    // Conservamos jobs falhos por 1 dia para inspeção via Bull Board.
    removeOnFail: { age: 86_400 },
};

@Injectable()
export class SendMailWelcomeProducer {
    private readonly logger = new Logger(SendMailWelcomeProducer.name);

    constructor(@InjectQueue('sendMailWelcomeQueue') private queue: Queue<WelcomeJobData>) { }

    async sendMailWelcome(data: WelcomeJobData) {
        const job = await this.queue.add('sendMailWelcomeJob', data, WELCOME_JOB_OPTIONS);
        // Não logamos `token`: somente identificadores.
        this.logger.log(`Welcome enfileirado jobId=${job.id} email=${data.email}`);
        return job;
    }

}
