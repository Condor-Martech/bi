import { BackupService } from './backup.service';
import { AccountsService } from '../../modules/accounts/accounts.service';
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DateTime } from 'luxon';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);
    constructor(
        private readonly account: AccountsService,
        private readonly backupService: BackupService

    ) { }
    // @Cron(CronExpression.EVERY_MINUTE, {
    //     timeZone: 'America/Sao_Paulo',
    // })
    // async handleCron() {
    //     try {
    //         const allAccounts = await this.account.findAllAccounts();
    //         for (const account of allAccounts) {
    //             const email = account.email;
    //             const expiresOn = await this.account.findByExpiresOn(email);
    //             const now = DateTime.now().setZone('America/Sao_Paulo').toSeconds();
    //             const difference = Number(expiresOn) - now;
    //             const twoThreeInSeconds = 4 * 60;
    //             this.logger.log(`falta para expirar: ${difference}`);

    //             if (difference < twoThreeInSeconds || difference < 0) {
    //                 await this.account.getNewAccessToken(email);
    //             } else {
    //                 this.logger.log(`Token Valido, falta: ${difference} segundos para expirar`);
    //             }
    //         }
    //     } catch (error) {
    //         this.logger.error(error);
    //     }
    // }
    @Cron('0 0 * * *', {
        timeZone: 'America/Sao_Paulo',
    })
    async backup() {
        try {
            const file = await this.backupService.backup();
            this.logger.log(`Backup realizado com sucesso: ${file}`);
        } catch (error) {
            // backup() lança em caso de falha — o log de "sucesso" acima só ocorre se realmente funcionou.
            this.logger.error(`Falha no backup agendado: ${error?.message ?? error}`);
        }
    }
}

