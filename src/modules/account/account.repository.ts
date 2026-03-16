import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from './account.entity';
import { Repository } from 'typeorm/repository/Repository';
import { WhereClause } from 'typeorm/query-builder/WhereClause';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { FilterAccountDto } from './dtos/filter-account.dto';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { Role } from './enums/role.enum';
import { BaseRepository } from 'src/common/repository/base.repository';
import { IsNull } from 'typeorm';
import { Status } from './enums/account-status.enum';
import { AccountStatisticsDto } from './dtos/account-statistics.dto';

@Injectable()
export class AccountRepository extends BaseRepository<AccountEntity> {
  constructor(
    @InjectRepository(AccountEntity)
    repository: Repository<AccountEntity>,
  ) {
    super(repository, AccountEntity);
  }

  async Create(
    account: AccountEntity,
    entityManager?: EntityManager,
  ): Promise<AccountEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(account);
  }

  async FindById(
    id: string,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<AccountEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const where: FindOptionsWhere<AccountEntity> = { id: id };
    if (!includeDeleted) {
      return repository.findOne({
        where: { ...where, deletedAt: IsNull() },
      });
    }

    return repository.findOne({ where: where });
  }

  //ignore page & limit
  async FindAll(
    includeDeleted: boolean,
    excludeId: string,
    role: Role[],
    query?: FilterAccountDto,
    entityManager?: EntityManager,
  ): Promise<AccountEntity[]> {
    const repository = await this.GetRepository(entityManager);

    const qb = repository
      .createQueryBuilder('account')
      .where('account.id != :excludeId', { excludeId })
      .andWhere('account.role IN (:...role)', { role });

    if (query?.search && query?.searchBy) {
      const isEnumSearchField =
        query.searchBy === 'role' || query.searchBy === 'status';
      const searchField = isEnumSearchField
        ? `CAST(account.${query.searchBy} AS TEXT)`
        : `account.${query.searchBy}`;
      qb.andWhere(`${searchField} ILIKE :search`, {
        search: `%${query.search.trim()}%`,
      });
    }

    if (query?.orderBy && query?.order) {
      const orderField = `account.${query.orderBy}`;
      qb.orderBy(orderField, query.order as 'ASC' | 'DESC');
    }
    if (!includeDeleted) {
      qb.andWhere('account.deletedAt IS NULL');
    }

    return qb.getMany();
  }

  async FindPaginated(
    includeDeleted: boolean,
    excludeId: string,
    role: Role[],
    query?: FilterAccountDto,
    entityManager?: EntityManager,
  ): Promise<PaginationResultDto<AccountEntity>> {
    const repository = await this.GetRepository(entityManager);

    const qb = repository
      .createQueryBuilder('account')
      .where('account.id != :excludeId', { excludeId })
      .andWhere('account.role IN (:...role)', { role });

    if (query?.search && query?.searchBy) {
      const isEnumSearchField =
        query.searchBy === 'role' || query.searchBy === 'status';
      const searchField = isEnumSearchField
        ? `CAST(account.${query.searchBy} AS TEXT)`
        : `account.${query.searchBy}`;
      qb.andWhere(`${searchField} ILIKE :search`, {
        search: `%${query.search.trim()}%`,
      });
    }
    if (query?.orderBy && query?.order) {
      const orderField = `account.${query.orderBy}`;
      qb.orderBy(orderField, query.order as 'ASC' | 'DESC');
    }

    if (!includeDeleted) {
      qb.andWhere('account.deletedAt IS NULL');
    }

    const totalItems = await qb.getCount();

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<AccountEntity>(
      items,
      Math.ceil(totalItems / limit),
      page,
      limit,
      query?.search || '',
      query?.searchBy || '',
      query?.order || '',
      query?.orderBy || '',
      page < Math.ceil(totalItems / limit),
      page > 1,
    );
  }

  async FindByEmail(
    email: string,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<AccountEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const where: FindOptionsWhere<AccountEntity> = { email: email };
    if (!includeDeleted) {
      return repository.findOne({
        where: { ...where, deletedAt: IsNull() },
      });
    }

    return repository.findOne({ where: where });
  }

  async Update(
    account: AccountEntity,
    entityManager?: EntityManager,
  ): Promise<AccountEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(account);
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

  async GetStatistics(
    includeDeleted: boolean,
    excludeId: string,
    roles: Role[],
    entityManager?: EntityManager,
  ): Promise<AccountStatisticsDto> {
    if (!roles.length) {
      return {
        totalAccounts: 0,
        adminCount: 0,
        managerCount: 0,
        annotatorCount: 0,
        reviewerCount: 0,
        activeCount: 0,
        inactiveCount: 0,
        needChangePasswordCount: 0,
      };
    }

    const repository = await this.GetRepository(entityManager);
    const qb = repository
      .createQueryBuilder('account')
      .select('COUNT(account.id)', 'totalAccounts')
      .addSelect(
        'SUM(CASE WHEN account.role = :adminRole THEN 1 ELSE 0 END)',
        'adminCount',
      )
      .addSelect(
        'SUM(CASE WHEN account.role = :managerRole THEN 1 ELSE 0 END)',
        'managerCount',
      )
      .addSelect(
        'SUM(CASE WHEN account.role = :annotatorRole THEN 1 ELSE 0 END)',
        'annotatorCount',
      )
      .addSelect(
        'SUM(CASE WHEN account.role = :reviewerRole THEN 1 ELSE 0 END)',
        'reviewerCount',
      )
      .addSelect(
        'SUM(CASE WHEN account.status = :activeStatus THEN 1 ELSE 0 END)',
        'activeCount',
      )
      .addSelect(
        'SUM(CASE WHEN account.status = :inactiveStatus THEN 1 ELSE 0 END)',
        'inactiveCount',
      )
      .addSelect(
        'SUM(CASE WHEN account.status = :needChangePasswordStatus THEN 1 ELSE 0 END)',
        'needChangePasswordCount',
      )
      .where('account.id != :excludeId', { excludeId })
      .andWhere('account.role IN (:...roles)', { roles })
      .setParameters({
        adminRole: Role.ADMIN,
        managerRole: Role.MANAGER,
        annotatorRole: Role.ANNOTATOR,
        reviewerRole: Role.REVIEWER,
        activeStatus: Status.ACTIVE,
        inactiveStatus: Status.INACTIVE,
        needChangePasswordStatus: Status.NEED_CHANGE_PASSWORD,
      });

    if (!includeDeleted) {
      qb.andWhere('account.deletedAt IS NULL');
    }

    const raw = await qb.getRawOne<{
      totalAccounts: string;
      adminCount: string;
      managerCount: string;
      annotatorCount: string;
      reviewerCount: string;
      activeCount: string;
      inactiveCount: string;
      needChangePasswordCount: string;
    }>();

    return {
      totalAccounts: Number(raw?.totalAccounts ?? 0),
      adminCount: Number(raw?.adminCount ?? 0),
      managerCount: Number(raw?.managerCount ?? 0),
      annotatorCount: Number(raw?.annotatorCount ?? 0),
      reviewerCount: Number(raw?.reviewerCount ?? 0),
      activeCount: Number(raw?.activeCount ?? 0),
      inactiveCount: Number(raw?.inactiveCount ?? 0),
      needChangePasswordCount: Number(raw?.needChangePasswordCount ?? 0),
    };
  }
}
