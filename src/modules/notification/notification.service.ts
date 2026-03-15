import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
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

@Injectable()
export class NotificationService extends BaseService {
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
      const account = await this.accountRepository.FindById(dto.accountId, false);
      if (!account) throw new AccountNotFoundException();

      const entity = Object.assign(new NotificationEntity(), {
        accountId: dto.accountId,
        notificationType: dto.notificationType,
        title: dto.title,
        content: dto.content,
        relatedEntityId: dto.relatedEntityId ?? null,
        additionalData: dto.additionalData ?? null,
      });

      return this.notificationRepository.create(entity, tx);
    });

    this.notificationGateway.fireNotificationToAccount(dto.accountId, saved);
    return saved;
  }

  async FindPaginated(
    query: FilterNotificationQueryDto,
    em?: EntityManager,
  ): Promise<PaginationResultDto<NotificationEntity>> {
    const repository = await this.notificationRepository.GetRepository(em);
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const offset = (page - 1) * limit;
    const order = (query?.order?.toUpperCase() ?? 'DESC') as 'ASC' | 'DESC';
    const orderBy = query?.orderBy ?? 'createdAt';

    const qb = repository.createQueryBuilder('notification');

    if (!query?.includeDeleted) {
      qb.andWhere('notification.deletedAt IS NULL');
    }

    if (query?.accountId) {
      qb.andWhere('notification.accountId = :accountId', { accountId: query.accountId });
    }

    if (query?.unreadOnly) {
      qb.andWhere('notification.isRead = false');
    }

    qb.orderBy(`notification.${orderBy}`, order);

    const totalItems = await qb.getCount();
    const totalPages = Math.ceil(totalItems / limit);
    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<NotificationEntity>(
      items,
      totalPages,
      page,
      limit,
      '',
      '',
      order,
      orderBy,
      page < totalPages,
      page > 1,
    );
  }

  async MarkManyAsRead(dto: MarkNotificationsReadDto, accountId: string): Promise<{ updated: number }> {
    const updated = await this.notificationRepository.markManyAsRead(dto.notificationIds, accountId);
    return { updated };
  }

  async MarkAllAsRead(accountId: string): Promise<{ updated: number }> {
    const updated = await this.notificationRepository.markAllAsRead(accountId);
    return { updated };
  }
}
