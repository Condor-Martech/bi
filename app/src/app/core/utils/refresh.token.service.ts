import { DateTime } from 'luxon';
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { AccountsService } from "../../modules/accounts/accounts.service";


@Injectable()
export class RefreshToken {

    constructor(
        @Inject(forwardRef(() => AccountsService))
        private readonly account: AccountsService
    ) { }
    async refresh(email: string) {
        const expiresOn = await this.account.findByExpiresOn(email);
        const now = DateTime.now().setZone('America/Sao_Paulo').toSeconds();
        const difference = Number(expiresOn) - now;
        const thresholdInSeconds = 3 * 60;
        if (difference < thresholdInSeconds) {
            await this.account.getNewAccessToken(email);
        }
    }

}