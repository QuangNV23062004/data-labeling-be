import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { ReviewErrorTypeEntity } from './review-error-type.entity';
import { FilterReviewErrorTypeQueryDto } from './dtos/filter-review-error-type-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';

@Injectable()
export class ReviewErrorTypeRepository extends BaseRepository<ReviewErrorTypeEntity> {
  constructor(
    @InjectRepository(ReviewErrorTypeEntity)
    repository: Repository<ReviewErrorTypeEntity>,
  ) {
    super(repository, ReviewErrorTypeEntity);
  }

  async FindByName(
    name: string,
    includeDeleted: boolean,
    excludeId?: string,
    entityManager?: EntityManager,
  ): Promise<ReviewErrorTypeEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('review_error_type');

    qb.where('review_error_type.name ILIKE unaccent(:name)', { name });

    if (excludeId) {
      qb.andWhere('review_error_type.id != :excludeId', { excludeId });
    }

    if (!includeDeleted) {
      qb.andWhere('review_error_type.deletedAt IS NULL');
    }

    return qb.getOne();
  }

  async Create(
    reviewErrorType: ReviewErrorTypeEntity,
    entityManager?: EntityManager,
  ): Promise<ReviewErrorTypeEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(reviewErrorType);
  }

  async FindById(
    id: string,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<ReviewErrorTypeEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('review_error_type');

    qb.where('review_error_type.id = :id', { id });

    if (!includeDeleted) {
      qb.andWhere('review_error_type.deletedAt IS NULL');
    }

    return qb.getOne();
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<ReviewErrorTypeEntity[]> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('review_error_type');

    qb.where('review_error_type.id IN (:...ids)', { ids });

    if (!includeDeleted) {
      qb.andWhere('review_error_type.deletedAt IS NULL');
    }

    return qb.getMany();
  }

  async FindAll(
    query: FilterReviewErrorTypeQueryDto,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<ReviewErrorTypeEntity[]> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('review_error_type');

    if (query?.search && query?.searchBy) {
      qb.andWhere(`(review_error_type.${query.searchBy} ILIKE :search)`, {
        search: `%${query.search}%`,
      });
    }

    if (!includeDeleted) {
      qb.andWhere('review_error_type.deletedAt IS NULL');
    }

    if (query?.orderBy && query?.order) {
      qb.orderBy(
        `review_error_type.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    return qb.getMany();
  }

  async FindPaginated(
    query: FilterReviewErrorTypeQueryDto,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<PaginationResultDto<ReviewErrorTypeEntity>> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('review_error_type');

    if (query?.search && query?.searchBy) {
      qb.andWhere(`(review_error_type.${query.searchBy} ILIKE :search)`, {
        search: `%${query.search}%`,
      });
    }

    if (!includeDeleted) {
      qb.andWhere('review_error_type.deletedAt IS NULL');
    }

    if (query?.orderBy && query?.order) {
      qb.orderBy(
        `review_error_type.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    const totalItems = await qb.getCount();

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<ReviewErrorTypeEntity>(
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
    reviewErrorType: ReviewErrorTypeEntity,
    entityManager?: EntityManager,
  ): Promise<ReviewErrorTypeEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(reviewErrorType);
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
