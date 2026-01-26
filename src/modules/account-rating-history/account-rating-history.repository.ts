import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountRatingHistoryEntity } from './account-rating-history.entity';
@Injectable()
export class AccountRatingHistoryRepository extends BaseRepository<AccountRatingHistoryEntity> {
  constructor(@InjectRepository(AccountRatingHistoryEntity)
      repository: Repository<AccountRatingHistoryEntity>,) {
    super(repository, AccountRatingHistoryEntity);
  }
}
