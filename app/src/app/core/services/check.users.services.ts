import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class CheckUsers {
    constructor(
        private readonly users: UsersService
    ) { }

    async checkUsersExistInAccount(accountID: string) {

        await this.users.findByAccountId(accountID);
    }
}