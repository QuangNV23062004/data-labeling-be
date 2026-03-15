import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repository/base.repository';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { FilterNotificationQueryDto } from './dtos/filter-notification-query.dto';
import { NotificationEntity } from './notification.entity';

@Injectable()
export class NotificationRepository extends BaseRepository<NotificationEntity> {
  constructor(
    @InjectRepository(NotificationEntity)
    repository: Repository<NotificationEntity>,
  ) {
    super(repository, NotificationEntity);
  }

  async create(entity: NotificationEntity, em?: EntityManager): Promise<NotificationEntity> {
    return em ? em.save(entity) : this.repository.save(entity);
  }

  async markManyAsRead(ids: string[], accountId: string): Promise<number> {
    const result = await this.repository.update(
      { id: In(ids), accountId, isRead: false },
      { isRead: true },
    );
    return result.affected ?? 0;
  }

  async markAllAsRead(accountId: string): Promise<number> {
    const result = await this.repository.update(
      { accountId, isRead: false },
      { isRead: true },
    );
    return result.affected ?? 0;
  }

  async deleteMany(ids: string[], accountId: string): Promise<number> {
    const result = await this.repository.delete({ id: In(ids), accountId });
    return result.affected ?? 0;
  }

  async deleteAll(accountId: string): Promise<number> {
    const result = await this.repository.delete({ accountId });
    return result.affected ?? 0;
  }

  async countUnread(accountId: string): Promise<number> {
    return this.repository.count({ where: { accountId, isRead: false } });
  }

  async findPaginated(
    query: FilterNotificationQueryDto,
  ): Promise<PaginationResultDto<NotificationEntity>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const offset = (page - 1) * limit;
    const order = (query?.order?.toUpperCase() ?? 'DESC') as 'ASC' | 'DESC';
    const orderBy = query?.orderBy ?? 'createdAt';

    const qb = this.repository.createQueryBuilder('notification');

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
}
