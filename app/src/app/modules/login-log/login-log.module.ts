import { Module } from '@nestjs/common';
import { LoginLogService } from './login-log.service';
import { LoginLogController } from './login-log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginLog, LoginSchema } from './login-log.entity';
import { User, UserSchema } from '../users/user.entity';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: LoginLog.name, schema: LoginSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [LoginLogController],
  providers: [LoginLogService],
  exports: [LoginLogService]
})
export class LoginLogModule { }
