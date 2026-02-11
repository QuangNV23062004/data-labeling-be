import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ReviewEntity } from './review.entity';
import { FilterReviewQueryDto } from './dtos/filter-review-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
@Injectable()
export class ReviewRepository extends BaseRepository<ReviewEntity> {
  constructor(
    @InjectRepository(ReviewEntity)
    repository: Repository<ReviewEntity>,
  ) {
    super(repository, ReviewEntity);
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<ReviewEntity | null> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('review');
    qb.where('review.id = :id', { id });

    if (!includeDeleted) {
      qb.andWhere('review.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'review.checklistAnswer',
        'checklistAnswer',
        'checklistAnswer.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'review.reviewErrors',
        'errors',
        'errors.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('review.checklistAnswer', 'checklistAnswer');
      qb.leftJoinAndSelect('review.reviewErrors', 'errors');
    }

    return qb.getOne();
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<ReviewEntity[]> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('review');
    qb.where('review.id IN (:...ids)', { ids });

    if (!includeDeleted) {
      qb.andWhere('review.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'review.checklistAnswer',
        'checklistAnswer',
        'checklistAnswer.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'review.reviewErrors',
        'errors',
        'errors.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('review.checklistAnswer', 'checklistAnswer');
      qb.leftJoinAndSelect('review.reviewErrors', 'errors');
    }
    return qb.getMany();
  }

  async FindAll(
    query: FilterReviewQueryDto,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<ReviewEntity[]> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('review');

    if (!includeDeleted) {
      qb.andWhere('review.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'review.checklistAnswer',
        'checklistAnswer',
        'checklistAnswer.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'review.reviewErrors',
        'errors',
        'errors.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('review.checklistAnswer', 'checklistAnswer');
      qb.leftJoinAndSelect('review.reviewErrors', 'errors');
    }

    if (query?.search && query?.searchBy) {
      qb.andWhere(`(review.${query.searchBy} ILIKE :search)`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.fileLabelId) {
      qb.andWhere('review.fileLabelId = :fileLabelId', {
        fileLabelId: query.fileLabelId,
      });
    }

    if (query?.reviewerId) {
      qb.andWhere('review.reviewerId = :reviewerId', {
        reviewerId: query.reviewerId,
      });
    }

    if (query?.decision) {
      qb.andWhere('review.decision = :decision', { decision: query.decision });
    }

    if (query?.checklistAnswerId) {
      qb.andWhere('review.checklistAnswerId = :checklistAnswerId', {
        checklistAnswerId: query.checklistAnswerId,
      });
    }
    if (query?.orderBy && query?.order) {
      qb.orderBy(
        `review.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    return qb.getMany();
  }

  async FindPaginated(
    query: FilterReviewQueryDto,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<PaginationResultDto<ReviewEntity>> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('review');

    if (!includeDeleted) {
      qb.andWhere('review.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'review.checklistAnswer',
        'checklistAnswer',
        'checklistAnswer.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'review.reviewErrors',
        'errors',
        'errors.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('review.checklistAnswer', 'checklistAnswer');
      qb.leftJoinAndSelect('review.reviewErrors', 'errors');
    }

    if (query?.search && query?.searchBy) {
      qb.andWhere(`(review.${query.searchBy} ILIKE :search)`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.fileLabelId) {
      qb.andWhere('review.fileLabelId = :fileLabelId', {
        fileLabelId: query.fileLabelId,
      });
    }

    if (query?.reviewerId) {
      qb.andWhere('review.reviewerId = :reviewerId', {
        reviewerId: query.reviewerId,
      });
    }

    if (query?.decision) {
      qb.andWhere('review.decision = :decision', { decision: query.decision });
    }

    if (query?.checklistAnswerId) {
      qb.andWhere('review.checklistAnswerId = :checklistAnswerId', {
        checklistAnswerId: query.checklistAnswerId,
      });
    }
    if (query?.orderBy && query?.order) {
      qb.orderBy(
        `review.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    const totalItems = await qb.getCount();

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<ReviewEntity>(
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
        fileLabelId: query?.fileLabelId,
        reviewerId: query?.reviewerId,
        decision: query?.decision,
        checklistAnswerId: query?.checklistAnswerId,
      },
    );
  }

  async Create(
    review: ReviewEntity,
    em?: EntityManager,
  ): Promise<ReviewEntity> {
    const repository = await this.GetRepository(em);
    return repository.save(review);
  }

  async Update(
    review: ReviewEntity,
    em?: EntityManager,
  ): Promise<ReviewEntity> {
    const repository = await this.GetRepository(em);
    return repository.save(review);
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

  async FindByChecklistAnswerId(
    checklistAnswerId: string,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ) {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('review');
    qb.where('review.checklistAnswerId = :checklistAnswerId', {
      checklistAnswerId,
    });

    if (!includeDeleted) {
      qb.andWhere('review.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'review.checklistAnswer',
        'checklistAnswer',
        'checklistAnswer.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'review.reviewErrors',
        'errors',
        'errors.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('review.checklistAnswer', 'checklistAnswer');
      qb.leftJoinAndSelect('review.reviewErrors', 'errors');
    }

    return qb.getOne();
  }
}
