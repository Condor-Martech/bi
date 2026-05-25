import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { UsersModule } from '../users/users.module';
import { SseAuthGuard } from 'src/app/core/auth/sse-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    UsersModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, SseAuthGuard],
  exports: [NotificationsService]
})
export class NotificationsModule { }
