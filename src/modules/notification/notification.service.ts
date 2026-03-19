import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BaseService } from 'src/common/service/base.service';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { AccountRepository } from '../account/account.repository';
import { AccountNotFoundException } from '../account/exceptions/account-exceptions.exceptions';
import { NotificationRepository } from './notification.repository';
import { NotificationGateway } from './notification.gateway';
import { NotificationEntity } from './notification.entity';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { FilterNotificationQueryDto } from './dtos/filter-notification-query.dto';
import { MarkNotificationsReadDto } from './dtos/mark-notifications-read.dto';
import { DeleteNotificationsDto } from './dtos/delete-notifications.dto';

@Injectable()
export class NotificationService extends BaseService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly accountRepository: AccountRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {
    super();
  }

  async Create(dto: CreateNotificationDto): Promise<NotificationEntity> {
    const em = await this.notificationRepository.GetEntityManager();

    const saved = await em.transaction(async (tx) => {
      const account = await this.accountRepository.FindById(dto.accountId, false, tx);
      if (!account) throw new AccountNotFoundException();

      const entity = Object.assign(new NotificationEntity(), {
        accountId: dto.accountId,
        title: dto.title,
        content: dto.content,
        additionalData: dto.additionalData ?? null,
      });

      return this.notificationRepository.Create(entity, tx);
    });

    this.notificationGateway.fireNotificationToAccount(dto.accountId, saved);
    return saved;
  }

  @OnEvent('notification.create')
  async handleNotificationCreate(dto: CreateNotificationDto): Promise<void> {
    try {
      await this.Create(dto);
    } catch (err) {
      this.logger.error('Background notification creation failed', err);
    }
  }

  async FindPaginated(
    query: FilterNotificationQueryDto,
  ): Promise<PaginationResultDto<NotificationEntity>> {
    return this.notificationRepository.FindPaginated(query);
  }

  async MarkManyAsRead(dto: MarkNotificationsReadDto, accountId: string): Promise<{ updated: number }> {
    const updated = await this.notificationRepository.MarkManyAsRead(dto.notificationIds, accountId);
    const unreadCount = await this.notificationRepository.CountUnread(accountId);
    this.notificationGateway.fireReadStatusToAccount(accountId, dto.notificationIds);
    this.notificationGateway.fireUnreadCountToAccount(accountId, unreadCount);
    return { updated };
  }

  async MarkAllAsRead(accountId: string): Promise<{ updated: number }> {
    const updated = await this.notificationRepository.MarkAllAsRead(accountId);
    this.notificationGateway.fireReadStatusToAccount(accountId, null);
    this.notificationGateway.fireUnreadCountToAccount(accountId, 0);
    return { updated };
  }

  async DeleteMany(dto: DeleteNotificationsDto, accountId: string): Promise<{ deleted: number }> {
    const deleted = await this.notificationRepository.DeleteMany(dto.notificationIds, accountId);
    this.notificationGateway.fireDeletedToAccount(accountId, dto.notificationIds);
    return { deleted };
  }

  async DeleteAll(accountId: string): Promise<{ deleted: number }> {
    const deleted = await this.notificationRepository.DeleteAll(accountId);
    this.notificationGateway.fireDeletedToAccount(accountId, null);
    return { deleted };
  }

  async CountUnread(accountId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationRepository.CountUnread(accountId);
    return { unreadCount };
  }
}
