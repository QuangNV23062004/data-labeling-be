import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ReviewErrorEntity } from './review-error.entity';
import { FilterReviewErrorQueryDto } from './dtos/filter-review-error-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';

@Injectable()
export class ReviewErrorRepository extends BaseRepository<ReviewErrorEntity> {
  constructor(
    @InjectRepository(ReviewErrorEntity)
    repository: Repository<ReviewErrorEntity>,
  ) {
    super(repository, ReviewErrorEntity);
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<ReviewErrorEntity | null> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('reviewError');
    qb.where('reviewError.id = :id', { id });

    if (!includeDeleted) {
      qb.andWhere('reviewError.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'reviewError.review',
        'review',
        'review.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'reviewError.reviewErrorType',
        'reviewErrorType',
        'reviewErrorType.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('reviewError.review', 'review');
      qb.leftJoinAndSelect('reviewError.reviewErrorType', 'reviewErrorType');
    }

    return qb.getOne();
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<ReviewErrorEntity[]> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('reviewError');
    qb.where('reviewError.id IN (:...ids)', { ids });

    if (!includeDeleted) {
      qb.andWhere('reviewError.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'reviewError.review',
        'review',
        'review.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'reviewError.reviewErrorType',
        'reviewErrorType',
        'reviewErrorType.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('reviewError.review', 'review');
      qb.leftJoinAndSelect('reviewError.reviewErrorType', 'reviewErrorType');
    }

    return qb.getMany();
  }

  async FindAll(
    query: FilterReviewErrorQueryDto,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<ReviewErrorEntity[]> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('reviewError');

    if (!includeDeleted) {
      qb.andWhere('reviewError.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'reviewError.review',
        'review',
        'review.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'reviewError.reviewErrorType',
        'reviewErrorType',
        'reviewErrorType.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('reviewError.review', 'review');
      qb.leftJoinAndSelect('reviewError.reviewErrorType', 'reviewErrorType');
    }

    if (query?.search && query?.searchBy) {
      qb.andWhere(`(reviewError.${query.searchBy} ILIKE :search)`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.reviewId) {
      qb.andWhere('reviewError.reviewId = :reviewId', {
        reviewId: query.reviewId,
      });
    }

    if (query?.reviewErrorTypeId) {
      qb.andWhere('reviewError.reviewErrorTypeId = :reviewErrorTypeId', {
        reviewErrorTypeId: query.reviewErrorTypeId,
      });
    }

    if (query?.orderBy && query?.order) {
      qb.orderBy(
        `reviewError.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    return qb.getMany();
  }

  async FindPaginated(
    query: FilterReviewErrorQueryDto,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<PaginationResultDto<ReviewErrorEntity>> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('reviewError');

    if (!includeDeleted) {
      qb.andWhere('reviewError.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'reviewError.review',
        'review',
        'review.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'reviewError.reviewErrorType',
        'reviewErrorType',
        'reviewErrorType.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('reviewError.review', 'review');
      qb.leftJoinAndSelect('reviewError.reviewErrorType', 'reviewErrorType');
    }

    if (query?.search && query?.searchBy) {
      qb.andWhere(`(reviewError.${query.searchBy} ILIKE :search)`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.reviewId) {
      qb.andWhere('reviewError.reviewId = :reviewId', {
        reviewId: query.reviewId,
      });
    }

    if (query?.reviewErrorTypeId) {
      qb.andWhere('reviewError.reviewErrorTypeId = :reviewErrorTypeId', {
        reviewErrorTypeId: query.reviewErrorTypeId,
      });
    }

    if (query?.orderBy && query?.order) {
      qb.orderBy(
        `reviewError.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    const totalItems = await qb.getCount();

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<ReviewErrorEntity>(
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
      {
        reviewId: query?.reviewId,
        reviewErrorTypeId: query?.reviewErrorTypeId,
      },
    );
  }

  async Create(
    reviewError: ReviewErrorEntity,
    em?: EntityManager,
  ): Promise<ReviewErrorEntity> {
    const repository = await this.GetRepository(em);
    return repository.save(reviewError);
  }

  async Update(
    reviewError: ReviewErrorEntity,
    em?: EntityManager,
  ): Promise<ReviewErrorEntity> {
    const repository = await this.GetRepository(em);
    return repository.save(reviewError);
  }

  async SoftDelete(id: string, em?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.update(id, { deletedAt: new Date() });
    return result.affected! > 0;
  }

  async Restore(id: string, em?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.update(id, { deletedAt: null });
    return result.affected! > 0;
  }

  async HardDelete(id: string, em?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.delete(id);
    return result.affected! > 0;
  }

  async FindByReviewId(
    reviewId: string,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<ReviewErrorEntity[]> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('reviewError');
    qb.where('reviewError.reviewId = :reviewId', { reviewId });

    if (!includeDeleted) {
      qb.andWhere('reviewError.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'reviewError.review',
        'review',
        'review.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'reviewError.reviewErrorType',
        'reviewErrorType',
        'reviewErrorType.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('reviewError.review', 'review');
      qb.leftJoinAndSelect('reviewError.reviewErrorType', 'reviewErrorType');
    }

    return qb.getMany();
  }

  async FindByReviewErrorTypeId(
    reviewErrorTypeId: string,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<ReviewErrorEntity[]> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('reviewError');
    qb.where('reviewError.reviewErrorTypeId = :reviewErrorTypeId', {
      reviewErrorTypeId,
    });

    if (!includeDeleted) {
      qb.andWhere('reviewError.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'reviewError.review',
        'review',
        'review.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'reviewError.reviewErrorType',
        'reviewErrorType',
        'reviewErrorType.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('reviewError.review', 'review');
      qb.leftJoinAndSelect('reviewError.reviewErrorType', 'reviewErrorType');
    }

    return qb.getMany();
  }
}
