import { Injectable } from '@nestjs/common';
import { AccountRatingHistoryRepository } from './account-rating-history.repository';
import { BaseService } from 'src/common/service/base.service';

@Injectable()
export class AccountRatingHistoryService extends BaseService {
  constructor(
    private readonly accountRatingHistoryRepository: AccountRatingHistoryRepository,
  ) {
    super();
  }
}
