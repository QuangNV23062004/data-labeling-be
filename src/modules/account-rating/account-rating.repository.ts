import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountRatingEntity } from './account-rating.entity';
import { EntityManager } from 'typeorm';
import { FilterAccountRatingQueryDto } from './dtos/filter-account-rating-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';

@Injectable()
export class AccountRatingRepository extends BaseRepository<AccountRatingEntity> {
  constructor(
    @InjectRepository(AccountRatingEntity)
    repository: Repository<AccountRatingEntity>,
  ) {
    super(repository, AccountRatingEntity);
  }

  async Create(
    accountRating: AccountRatingEntity,
    entityManager?: EntityManager,
  ): Promise<AccountRatingEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(accountRating);
  }

  async FindById(
    id: string,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<AccountRatingEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('account_rating');

    qb.where('account_rating.id = :id', { id });

    if (!includeDeleted) {
      qb.andWhere('account_rating.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'account_rating.account',
        'account',
        'account.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'account_rating.project',
        'project',
        'project.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'account_rating.history',
        'history',
        'history.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('account_rating.account', 'account');
      qb.leftJoinAndSelect('account_rating.project', 'project');
      qb.leftJoinAndSelect('account_rating.history', 'history');
    }

    return qb.getOne();
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<AccountRatingEntity[]> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('account_rating');

    qb.where('account_rating.id IN (:...ids)', { ids });

    if (!includeDeleted) {
      qb.andWhere('account_rating.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'account_rating.account',
        'account',
        'account.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'account_rating.project',
        'project',
        'project.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'account_rating.history',
        'history',
        'history.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('account_rating.account', 'account');
      qb.leftJoinAndSelect('account_rating.project', 'project');
      qb.leftJoinAndSelect('account_rating.history', 'history');
    }

    return qb.getMany();
  }

  async FindByAccountAndProject(
    accountId: string,
    projectId: string,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<AccountRatingEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('account_rating');

    qb.where('account_rating.accountId = :accountId', { accountId });
    qb.andWhere('account_rating.projectId = :projectId', { projectId });

    if (!includeDeleted) {
      qb.andWhere('account_rating.deletedAt IS NULL');
    }

    qb.orderBy('account_rating.createdAt', 'DESC');

    return qb.getOne();
  }

  async FindAll(
    query: FilterAccountRatingQueryDto,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<AccountRatingEntity[]> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('account_rating');

    if (query?.search) {
      const safeSearch = query.search.trim();
      qb.andWhere(
        '(account_rating.feedbacks ILIKE :search OR CAST(account_rating.accountId AS TEXT) ILIKE :search OR CAST(account_rating.projectId AS TEXT) ILIKE :search)',
        { search: `%${safeSearch}%` },
      );
    }

    if (query?.accountId) {
      qb.andWhere('account_rating.accountId = :accountId', {
        accountId: query.accountId,
      });
    }

    if (query?.projectId) {
      qb.andWhere('account_rating.projectId = :projectId', {
        projectId: query.projectId,
      });
    }

    if (!includeDeleted) {
      qb.andWhere('account_rating.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'account_rating.account',
        'account',
        'account.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'account_rating.project',
        'project',
        'project.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'account_rating.history',
        'history',
        'history.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('account_rating.account', 'account');
      qb.leftJoinAndSelect('account_rating.project', 'project');
      qb.leftJoinAndSelect('account_rating.history', 'history');
    }

    const sortBy =
      query?.sortBy &&
      ['accountId', 'projectId', 'createdAt', 'updatedAt'].includes(
        query.sortBy,
      )
        ? query.sortBy
        : 'createdAt';
    const order = query?.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`account_rating.${sortBy}`, order);

    return qb.getMany();
  }

  async FindPaginated(
    query: FilterAccountRatingQueryDto,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<PaginationResultDto<AccountRatingEntity>> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('account_rating');

    if (query?.search) {
      const safeSearch = query.search.trim();
      qb.andWhere(
        '(account_rating.feedbacks ILIKE :search OR CAST(account_rating.accountId AS TEXT) ILIKE :search OR CAST(account_rating.projectId AS TEXT) ILIKE :search)',
        { search: `%${safeSearch}%` },
      );
    }

    if (query?.accountId) {
      qb.andWhere('account_rating.accountId = :accountId', {
        accountId: query.accountId,
      });
    }

    if (query?.projectId) {
      qb.andWhere('account_rating.projectId = :projectId', {
        projectId: query.projectId,
      });
    }

    if (!includeDeleted) {
      qb.andWhere('account_rating.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'account_rating.account',
        'account',
        'account.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'account_rating.project',
        'project',
        'project.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'account_rating.history',
        'history',
        'history.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('account_rating.account', 'account');
      qb.leftJoinAndSelect('account_rating.project', 'project');
      qb.leftJoinAndSelect('account_rating.history', 'history');
    }

    const sortBy =
      query?.sortBy &&
      ['accountId', 'projectId', 'createdAt', 'updatedAt'].includes(
        query.sortBy,
      )
        ? query.sortBy
        : 'createdAt';
    const order = query?.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`account_rating.${sortBy}`, order);

    const totalItems = await qb.getCount();

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<AccountRatingEntity>(
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
    accountRating: AccountRatingEntity,
    entityManager?: EntityManager,
  ): Promise<AccountRatingEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(accountRating);
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

  async FindByProjectId(
    projectId: string,
    includeDeleted = false,
    transactionalEntityManager?: EntityManager,
  ): Promise<AccountRatingEntity[]> {
    const repo = await this.GetRepository(transactionalEntityManager);
    const where: any = { projectId };
    if (!includeDeleted) where.deletedAt = null;
    return repo.find({ where });
  }

  async CreateBatch(
    entities: AccountRatingEntity[],
    transactionalEntityManager?: EntityManager,
  ): Promise<AccountRatingEntity[]> {
    if (!entities.length) return [];
    const repo = await this.GetRepository(transactionalEntityManager);
    return repo.save(entities);
  }
}
