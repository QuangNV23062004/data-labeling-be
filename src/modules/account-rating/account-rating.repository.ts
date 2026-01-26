import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountRatingEntity } from './account-rating.entity';
@Injectable()
export class AccountRatingRepository extends BaseRepository<AccountRatingEntity> {
  constructor(@InjectRepository(AccountRatingEntity)
      repository: Repository<AccountRatingEntity>,) {
    super(repository, AccountRatingEntity);
  }
}
