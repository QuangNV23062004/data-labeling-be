import { Injectable } from '@nestjs/common';
import { AccountRatingHistoryRepository } from './account-rating-history.repository';
import { BaseService } from 'src/common/service/base.service';
import { AccountInfo } from 'src/interfaces/request/authenticated-request.interface';
import { FilterAccountDto } from '../account/dtos';

@Injectable()
export class AccountRatingHistoryService extends BaseService {
  constructor(
    private readonly accountRatingHistoryRepository: AccountRatingHistoryRepository,
  ) {
    super();
  }

  async FindAll(
    query: FilterAccountDto,
    includeDeleted: boolean,
    accountInfo?: AccountInfo,
  ) {
    const includeDeletedFlag = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.accountRatingHistoryRepository.FindAll(
      query,
      includeDeletedFlag,
    );
  }

  async FindPaginated(
    query: FilterAccountDto,
    includeDeleted: boolean,
    accountInfo?: AccountInfo,
  ) {
    const includeDeletedFlag = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.accountRatingHistoryRepository.FindPaginated(
      query,
      includeDeletedFlag,
    );
  }

  async FindById(
    id: string,
    includeDeleted: boolean,
    accountInfo?: AccountInfo,
  ) {
    const includeDeletedFlag = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.accountRatingHistoryRepository.FindById(id, includeDeletedFlag);
  }
}
