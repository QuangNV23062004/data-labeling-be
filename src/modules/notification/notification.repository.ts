import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repository/base.repository';
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
}
