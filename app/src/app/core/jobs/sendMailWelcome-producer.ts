import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";


@Injectable()
export class SendMailWelcomeProducer {
    constructor(@InjectQueue('sendMailWelcomeQueue') private queue: Queue) { }

    async sendMailWelcome(data: any) {
        await this.queue.add('sendMailWelcomeJob', data);
    }

}