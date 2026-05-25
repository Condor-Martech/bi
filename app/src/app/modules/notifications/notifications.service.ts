import { BadRequestException, Injectable, InternalServerErrorException, MessageEvent, NotFoundException } from '@nestjs/common';
import { Notification, NotificationDocument } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Model, Error as MongooseError } from 'mongoose';
import { UsersService } from '../users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Observable, Subject } from 'rxjs';
import { EventsService } from '../events/events.service';

@Injectable()
export class NotificationsService {
  /**
   * Canal in-process das notificações criadas. Cada item carrega o userID
   * destinatário para que o controller SSE filtre por usuário conectado.
   * Observação: vive na memória de um único processo Node — ver caveat
   * multi-instância no plano (escalar via Redis pub/sub no futuro).
   */
  private readonly notificationStream = new Subject<{ userID: string; payload: MessageEvent }>();

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly userService: UsersService,
    private readonly events: EventsService,
  ) { }

  /** Observable consumido pela rota SSE para entregar notificações em tempo real. */
  getStream(): Observable<{ userID: string; payload: MessageEvent }> {
    return this.notificationStream.asObservable();
  }

  /**
   * Push de evento ephemeral ao stream SSE de um usuário, SEM persistir em Mongo.
   *
   * Para eventos transitorios de UI (progress de jobs, status updates, etc.) que
   * NÃO devem aparecer no histórico/sino de notificações. Usa o mesmo canal SSE
   * — o controller filtra por userID antes de entregar.
   *
   * Fire-and-forget: erros silenciosos para não derrubar o caller.
   */
  pushTransient(userID: string, type: string, data: Record<string, unknown>): void {
    try {
      this.notificationStream.next({ userID, payload: { type, data } as MessageEvent });
    } catch {
      // Stream interno — não deve falhar. Se falhar, o caller não pode fazer nada.
    }
  }

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const users = await this.userService.findAll();
      const notificationPromises = users.map(async user => {
        const notificationData = {
          title: createNotificationDto.title,
          message: createNotificationDto.message,
          userID: user.id,
          readme: false
        };

        const notification = await this.notificationModel.create(notificationData);

        // Empurra a notificação para o stream SSE — o controller filtra por userID.
        this.notificationStream.next({
          userID: notification.userID,
          payload: { type: 'notification', data: notification.toObject() }
        });

        return notification;
      });
      await Promise.all(notificationPromises);
      return { message: 'Notifications created successfully' };

    } catch (error) {
      if (error instanceof MongooseError.CastError) {
        throw new BadRequestException(`Invalid ID format: ${error.message}`);
      }
      if (error instanceof MongooseError.DocumentNotFoundError) {
        throw new NotFoundException(`User not found: ${error.message}`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAllForUser(userID: string, page = 1, limit = 20) {
    try {
      const pageNum = Math.max(Number(page) || 1, 1);
      const limitNum = Math.max(Number(limit) || 20, 1);
      const skip = (pageNum - 1) * limitNum;

      const [data, total, unread] = await Promise.all([
        this.notificationModel
          .find({ userID })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .exec(),
        this.notificationModel.countDocuments({ userID }),
        this.notificationModel.countDocuments({ userID, readme: false })
      ]);

      return { data, meta: { page: pageNum, limit: limitNum, total, unread } };

    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const notification = await this.notificationModel.findById(id);
      if (!notification) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }
      return notification;

    } catch (error) {
      if (error instanceof MongooseError.CastError) {
        throw new BadRequestException(`Invalid ID format: ${error.message}`);
      }
      if (error instanceof MongooseError.DocumentNotFoundError) {
        throw new NotFoundException(`Notification with ID ${id} not found: ${error.message}`);
      }
      throw new InternalServerErrorException(`Unexpected error: ${error.message}`);
    }
  }

  async update(userId: string, notificationId: string) {
    try {
      const notification = await this.notificationModel.findOneAndUpdate(
        { _id: notificationId, userID: userId },
        { readme: true },
        { new: true }
      );
      if (!notification) {
        throw new NotFoundException(`Notification with ID ${notificationId} for user ID ${userId} not found`);
      }
      this.events.trackNotificationRead({ userId }, notificationId);
      return notification;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const result = await this.notificationModel.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }
      return { message: `Notification with ID ${id} has been removed` };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
