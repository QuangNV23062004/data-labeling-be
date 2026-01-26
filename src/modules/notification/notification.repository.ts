import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';
@Injectable()
export class NotificationRepository extends BaseRepository<NotificationEntity> {
  constructor(@InjectRepository(NotificationEntity)
      repository: Repository<NotificationEntity>,) {
    super(repository, NotificationEntity);
  }
}
