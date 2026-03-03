import { Injectable } from '@nestjs/common';
import { AccountRatingRepository } from './account-rating.repository';
import { BaseService } from 'src/common/service/base.service';
import { CreateAccountRatingDto } from './dtos/create-account-rating.dto';
import { AccountRatingEntity } from './account-rating.entity';
import { UpdateAccountRatingDto } from './dtos/update-account-rating.dto';
import { AccountRatingNotFoundException } from './exceptions/account-rating-exceptions.exception';
import { AccountRepository } from '../account/account.repository';
import { ProjectRepository } from '../project/project.repository';
import { AccountNotFoundException } from '../auth/exceptions/auth-exceptions.exceptions';
import { ProjectNotFoundException } from '../project/exceptions/project-exceptions.exception';
import { AccountInfo } from 'src/interfaces/request/authenticated-request.interface';
import { FilterAccountRatingQueryDto } from './dtos/filter-account-rating-query.dto';
import { FileLabelRepository } from '../file-label/file-label.repository';
import { FileLabelStatusEnums } from '../file-label/enums/file-label.enums';
import { ReviewEntity } from '../review/review.entity';
import { ReviewErrorEntity } from '../review-error/review-error.entity';
import { ReviewErrorTypeEntity } from '../review-error-type/review-error-type.entity';
import { AccountRatingHistoryEntity } from '../account-rating-history/account-rating-history.entity';
import { ProjectStatus } from '../project/enums/project-status.enums';

type ReviewErrorBreakdownSnapshot = {
  errorTypeId: string;
  name: string;
  description: string | null;
  severity: string;
  scoreImpact: number;
  count: number;
  totalImpact: number;
};

//computed => no update
@Injectable()
export class AccountRatingService extends BaseService {
  constructor(
    private readonly accountRatingRepository: AccountRatingRepository,
    private readonly accountRepository: AccountRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly fileLabelRepository: FileLabelRepository,
  ) {
    super();
  }

  async Create(dto: CreateAccountRatingDto) {
    const em = await this.accountRatingRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const account = await this.accountRepository.FindById(
        dto.accountId,
        false,
        transactionalEntityManager,
      );

      //check account
      if (!account) {
        throw new AccountNotFoundException();
      }

      const project = await this.projectRepository.FindById(
        dto.projectId,
        false,
        transactionalEntityManager,
      );

      // check project
      if (!project) {
        throw new ProjectNotFoundException(dto.projectId);
      }

      if (project.projectStatus !== ProjectStatus.COMPLETED) {
        throw new Error(
          `Cannot calculate account rating for project ${dto.projectId} because it is not completed yet. Current status: ${project.projectStatus}`,
        );
      }

      // aggregate metrics from file labels, reviews, and review errors inside db
      // TODO: migrate db query to repository layer, include soft delete, pass projectId and accountId as parameters
      const fileLabelRepository = await this.fileLabelRepository.GetRepository(
        transactionalEntityManager,
      );

      const metrics = await fileLabelRepository
        .createQueryBuilder('fileLabel')
        .innerJoin('fileLabel.file', 'file')
        .leftJoin(
          ReviewEntity,
          'review',
          'review.fileLabelId = fileLabel.id AND review.deletedAt IS NULL',
        )
        .leftJoin(
          ReviewErrorEntity,
          'reviewError',
          'reviewError.reviewId = review.id AND reviewError.deletedAt IS NULL',
        )
        .leftJoin(
          ReviewErrorTypeEntity,
          'reviewErrorType',
          'reviewErrorType.id = reviewError.reviewErrorTypeId AND reviewErrorType.deletedAt IS NULL',
        )
        .select('COUNT(DISTINCT fileLabel.id)', 'totalFileLabeled')
        .addSelect('COUNT(DISTINCT reviewError.id)', 'errorCount')
        .addSelect(
          'COALESCE(SUM(reviewErrorType.scoreImpact), 0)',
          'totalPenalty',
        )
        .where('file.projectId = :projectId', { projectId: dto.projectId })
        .andWhere('file.deletedAt IS NULL')
        .andWhere('fileLabel.deletedAt IS NULL')
        .andWhere('fileLabel.annotatorId = :accountId', {
          accountId: dto.accountId,
        })
        .getRawOne<{
          totalFileLabeled: string;
          errorCount: string;
          totalPenalty: string;
        }>();

      const totalFileLabeled = Number(metrics?.totalFileLabeled ?? 0);
      const errorCount = Number(metrics?.errorCount ?? 0);
      const totalPenalty = Number(metrics?.totalPenalty ?? 0);

      //get breakdown of review errors by type for history record
      // TODO: migrate db query to repository layer, include soft delete, pass projectId and accountId as parameters
      const reviewErrorBreakdownRows = await fileLabelRepository
        .createQueryBuilder('fileLabel')
        .innerJoin('fileLabel.file', 'file')
        .leftJoin(
          ReviewEntity,
          'review',
          'review.fileLabelId = fileLabel.id AND review.deletedAt IS NULL',
        )
        .innerJoin(
          ReviewErrorEntity,
          'reviewError',
          'reviewError.reviewId = review.id AND reviewError.deletedAt IS NULL',
        )
        .innerJoin(
          ReviewErrorTypeEntity,
          'reviewErrorType',
          'reviewErrorType.id = reviewError.reviewErrorTypeId AND reviewErrorType.deletedAt IS NULL',
        )
        .select('reviewErrorType.id', 'errorTypeId')
        .addSelect('reviewErrorType.name', 'name')
        .addSelect('reviewErrorType.description', 'description')
        .addSelect('reviewErrorType.severity', 'severity')
        .addSelect('reviewErrorType.scoreImpact', 'scoreImpact')
        .addSelect('COUNT(reviewError.id)', 'count')
        .addSelect(
          'COALESCE(SUM(reviewErrorType.scoreImpact), 0)',
          'totalImpact',
        )
        .where('file.projectId = :projectId', { projectId: dto.projectId })
        .andWhere('file.deletedAt IS NULL')
        .andWhere('fileLabel.deletedAt IS NULL')
        .andWhere('fileLabel.annotatorId = :accountId', {
          accountId: dto.accountId,
        })
        .groupBy('reviewErrorType.id')
        .addGroupBy('reviewErrorType.name')
        .addGroupBy('reviewErrorType.description')
        .addGroupBy('reviewErrorType.severity')
        .addGroupBy('reviewErrorType.scoreImpact')
        .getRawMany<{
          errorTypeId: string;
          name: string;
          description: string | null;
          severity: string;
          scoreImpact: string;
          count: string;
          totalImpact: string;
        }>();

      // map raw query result to desired breakdown format for history record
      const reviewErrorBreakdown: ReviewErrorBreakdownSnapshot[] =
        reviewErrorBreakdownRows.map((row) => ({
          errorTypeId: row.errorTypeId,
          name: row.name,
          description: row.description,
          severity: row.severity,
          scoreImpact: Number(row.scoreImpact ?? 0),
          count: Number(row.count ?? 0),
          totalImpact: Number(row.totalImpact ?? 0),
        }));

      // calculate final rating score based on total penalty and total files labeled, with a minimum score of 0,
      // TODO: move to domain layer
      const computedScore =
        totalFileLabeled > 0
          ? Math.max(0, Math.round(100 - totalPenalty / totalFileLabeled))
          : 0;

      // upsert account rating
      const existingRating =
        await this.accountRatingRepository.FindByAccountAndProject(
          dto.accountId,
          dto.projectId,
          false,
          transactionalEntityManager,
        );
      const previousRatingScore = existingRating?.ratingScore ?? 0;

      let accountRating: AccountRatingEntity;

      if (existingRating) {
        existingRating.ratingScore = computedScore;
        existingRating.errorCount = errorCount;
        existingRating.totalFileLabeled = totalFileLabeled;
        existingRating.feedbacks = dto.feedbacks || existingRating.feedbacks;
        accountRating = await this.accountRatingRepository.Update(
          existingRating,
          transactionalEntityManager,
        );
      } else {
        const entity: AccountRatingEntity = new AccountRatingEntity();
        entity.accountId = dto.accountId;
        entity.projectId = dto.projectId;
        entity.ratingScore = computedScore;
        entity.errorCount = errorCount;
        entity.totalFileLabeled = totalFileLabeled;
        entity.feedbacks = dto.feedbacks || '';
        accountRating = await this.accountRatingRepository.Create(
          entity,
          transactionalEntityManager,
        );
      }

      // create history record for this rating calculation
      const historyRepository = transactionalEntityManager.getRepository(
        AccountRatingHistoryEntity,
      );
      const historyEntity = new AccountRatingHistoryEntity();
      historyEntity.accountRatingId = accountRating.id;
      historyEntity.previousRatingScore = previousRatingScore;
      historyEntity.newRatingScore = accountRating.ratingScore;
      historyEntity.changeReason =
        dto.feedbacks ||
        `Recalculated from finalized file labels for project ${dto.projectId}`;
      historyEntity.changedAt = new Date();
      historyEntity.reviewError = {
        totalFileLabeled,
        errorCount,
        totalPenalty,
        breakdown: reviewErrorBreakdown,
      };
      await historyRepository.save(historyEntity);

      return accountRating;
    });
  }

  async FindById(
    id: string,
    includeDeleted = false,
    accountInfo?: AccountInfo,
  ) {
    const safeIncludeDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    const accountRating = await this.accountRatingRepository.FindById(
      id,
      safeIncludeDeleted,
    );

    if (!accountRating) {
      throw new AccountRatingNotFoundException(id);
    }

    return accountRating;
  }

  async FindAll(
    filter: FilterAccountRatingQueryDto,
    includeDeleted = false,
    accountInfo?: AccountInfo,
  ) {
    const safeIncludeDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return await this.accountRatingRepository.FindAll(
      filter,
      safeIncludeDeleted,
    );
  }

  async FindPaginated(
    filter: FilterAccountRatingQueryDto,
    includeDeleted = false,
    accountInfo?: AccountInfo,
  ) {
    const safeIncludeDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return await this.accountRatingRepository.FindPaginated(
      filter,
      safeIncludeDeleted,
    );
  }

  async SoftDelete(id: string, accountInfo?: AccountInfo) {
    const em = await this.accountRatingRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const accountRating = await this.accountRatingRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      if (!accountRating) {
        throw new AccountRatingNotFoundException(id);
      }

      return await this.accountRatingRepository.SoftDelete(
        id,
        transactionalEntityManager,
      );
    });
  }
}
