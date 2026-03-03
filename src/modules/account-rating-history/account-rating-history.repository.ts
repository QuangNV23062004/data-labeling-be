import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountRatingHistoryEntity } from './account-rating-history.entity';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { FilterAccountRatingHistoryQueryDto } from './dtos/filter-account-rating-history-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
@Injectable()
export class AccountRatingHistoryRepository extends BaseRepository<AccountRatingHistoryEntity> {
  constructor(
    @InjectRepository(AccountRatingHistoryEntity)
    repository: Repository<AccountRatingHistoryEntity>,
  ) {
    super(repository, AccountRatingHistoryEntity);
  }

  async Create(
    accountRatingHistory: AccountRatingHistoryEntity,
    entityManager?: EntityManager,
  ): Promise<AccountRatingHistoryEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(accountRatingHistory);
  }

  async FindById(
    id: string,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<AccountRatingHistoryEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('account_rating_history');

    qb.where('account_rating_history.id = :id', { id });

    if (!includeDeleted) {
      qb.andWhere('account_rating_history.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'account_rating_history.accountRating',
        'account_rating',
        'account_rating.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect(
        'account_rating_history.accountRating',
        'account_rating',
      );
    }

    return qb.getOne();
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<AccountRatingHistoryEntity[]> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('account_rating_history');

    qb.where('account_rating_history.id IN (:...ids)', { ids });

    if (!includeDeleted) {
      qb.andWhere('account_rating_history.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'account_rating_history.accountRating',
        'account_rating',
        'account_rating.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect(
        'account_rating_history.accountRating',
        'account_rating',
      );
    }

    return qb.getMany();
  }

  async FindAll(
    query: FilterAccountRatingHistoryQueryDto,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<AccountRatingHistoryEntity[]> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('account_rating_history');

    if (query?.search) {
      const safeSearch = query.search.trim();
      qb.andWhere(
        '(account_rating_history.changeReason ILIKE :search OR CAST(account_rating_history.accountRatingId AS TEXT) ILIKE :search)',
        { search: `%${safeSearch}%` },
      );
    }

    if (!includeDeleted) {
      qb.andWhere('account_rating_history.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'account_rating_history.accountRating',
        'account_rating',
        'account_rating.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect(
        'account_rating_history.accountRating',
        'account_rating',
      );
    }

    qb.orderBy('account_rating_history.createdAt', 'DESC');

    return qb.getMany();
  }

  async FindPaginated(
    query: FilterAccountRatingHistoryQueryDto,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<PaginationResultDto<AccountRatingHistoryEntity>> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('account_rating_history');

    if (query?.search) {
      const safeSearch = query.search.trim();
      qb.andWhere(
        '(account_rating_history.changeReason ILIKE :search OR CAST(account_rating_history.accountRatingId AS TEXT) ILIKE :search)',
        { search: `%${safeSearch}%` },
      );
    }

    if (!includeDeleted) {
      qb.andWhere('account_rating_history.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'account_rating_history.accountRating',
        'account_rating',
        'account_rating.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect(
        'account_rating_history.accountRating',
        'account_rating',
      );
    }

    qb.orderBy('account_rating_history.createdAt', 'DESC');

    const totalItems = await qb.getCount();

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<AccountRatingHistoryEntity>(
      items,
      Math.ceil(totalItems / limit),
      page,
      limit,
      query?.search || '',
      '',
      '',
      '',
      page < Math.ceil(totalItems / limit),
      page > 1,
    );
  }

  async Update(
    accountRatingHistory: AccountRatingHistoryEntity,
    entityManager?: EntityManager,
  ): Promise<AccountRatingHistoryEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(accountRatingHistory);
  }

  async SoftDelete(
    id: string,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.update(id, { deletedAt: new Date() });
    return (result?.affected ?? 0) > 0;
  }

  async HardDelete(
    id: string,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.delete(id);
    return (result?.affected ?? 0) > 0;
  }

  async Restore(id: string, entityManager?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.update(id, { deletedAt: null });
    return (result?.affected ?? 0) > 0;
  }
}
