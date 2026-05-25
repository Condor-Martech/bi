import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";

@Injectable()
export class SendMailResetProducer {
    constructor(@InjectQueue('sendMailResetQueue') private queue: Queue) { }

    async sendMailResetPass(data: any) {
        await this.queue.add('sendMailResetJob', data);
    }

}