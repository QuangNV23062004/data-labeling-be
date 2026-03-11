import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ReviewEntity } from './review.entity';
import { FilterReviewQueryDto } from './dtos/filter-review-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { Decision } from './enums/decisions.enums';

export interface ReviewerAggregationStats {
  reviewerId: string;
  approved: number;
  rejected: number;
  totalReviewed: number;
  approvalRate: number;
  scoreImpact: number;
}
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

  async GetReviewerAggregationStats(
    reviewerId: string,
    em?: EntityManager,
  ): Promise<ReviewerAggregationStats> {
    const repository = await this.GetRepository(em);

    const decisionRow = await repository
      .createQueryBuilder('review')
      .select(
        `COALESCE(SUM(CASE WHEN review.decision = :approvedDecision THEN 1 ELSE 0 END), 0)`,
        'approved',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN review.decision = :rejectedDecision THEN 1 ELSE 0 END), 0)`,
        'rejected',
      )
      .where('review.reviewerId = :reviewerId', { reviewerId })
      .andWhere('review.deletedAt IS NULL')
      .setParameters({
        approvedDecision: Decision.APPROVED,
        rejectedDecision: Decision.REJECTED,
      })
      .getRawOne<{ approved: string; rejected: string }>();

    const scoreImpactRow = await repository
      .createQueryBuilder('review')
      .leftJoin(
        'review.reviewErrors',
        'reviewError',
        'reviewError.deletedAt IS NULL',
      )
      .leftJoin(
        'reviewError.reviewErrorType',
        'reviewErrorType',
        'reviewErrorType.deletedAt IS NULL',
      )
      .select('COALESCE(SUM(reviewErrorType.scoreImpact), 0)', 'scoreImpact')
      .where('review.reviewerId = :reviewerId', { reviewerId })
      .andWhere('review.deletedAt IS NULL')
      .getRawOne<{ scoreImpact: string }>();

    const approved = Number(decisionRow?.approved ?? 0);
    const rejected = Number(decisionRow?.rejected ?? 0);
    const totalReviewed = approved + rejected;
    const approvalRate =
      totalReviewed > 0
        ? Number(((approved / totalReviewed) * 100).toFixed(2))
        : 0;
    const scoreImpact = Number(scoreImpactRow?.scoreImpact ?? 0);

    return {
      reviewerId,
      approved,
      rejected,
      totalReviewed,
      approvalRate,
      scoreImpact,
    };
  }
}
