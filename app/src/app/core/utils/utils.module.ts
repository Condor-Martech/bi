import { Global, Module } from "@nestjs/common";
import { HashManager } from "./hash.manager";
import { Authenticator } from "./authenticator";
import { ConvertDate } from "./convert.date.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../../modules/users/user.entity";
import { RefreshToken } from "./refresh.token.service";


@Global()
@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    providers: [HashManager, ConvertDate, Authenticator, RefreshToken],
    exports: [HashManager, ConvertDate, Authenticator, RefreshToken]
})
export class UtilsModule { }