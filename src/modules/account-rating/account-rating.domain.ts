import { Injectable } from '@nestjs/common';
import { AccountEntity } from '../account/account.entity';
import { ProjectEntity } from '../project/project.entity';
import { AccountNotFoundException } from '../auth/exceptions/auth-exceptions.exceptions';
import { ProjectNotFoundException } from '../project/exceptions/project-exceptions.exception';
import { AccountRatingAlreadyExistsForProjectException } from './exceptions/account-rating-exceptions.exception';
import { ProjectStatus } from '../project/enums/project-status.enums';
import { AccountRatingEntity } from './account-rating.entity';
import { CreateAccountRatingDto } from './dtos/create-account-rating.dto';
import { AccountRatingHistoryEntity } from '../account-rating-history/account-rating-history.entity';
import { InvalidAccountRatingException } from './exceptions/account-rating-exceptions.exception';
import { AccountRatingErrorBreakdownRow } from 'src/types/account-rating-error-breakdown-row.types';
import { AccountRatingMetricsRow } from 'src/types/account-rating-metric-row.types';
import { CreateMode } from './enums/create-mode.enums';

type ReviewErrorBreakdownSnapshot = {
  errorTypeId: string;
  name: string;
  description: string | null;
  severity: string;
  scoreImpact: number;
  count: number;
  totalImpact: number;
};

type RatingMetricsSnapshot = {
  totalFileLabeled: number;
  errorCount: number;
  totalPenalty: number;
};

@Injectable()
export class AccountRatingDomain {
  validateAccountExists(account: AccountEntity | null | undefined): void {
    if (!account) {
      throw new AccountNotFoundException();
    }
  }

  validateProjectExists(
    project: ProjectEntity | null | undefined,
    projectId: string,
  ): void {
    if (!project) {
      throw new ProjectNotFoundException(projectId);
    }
  }

  validateProjectCompleted(project: ProjectEntity, projectId: string): void {
    if (project.projectStatus !== ProjectStatus.COMPLETED) {
      throw new InvalidAccountRatingException(
        `Cannot calculate account rating for project ${projectId} because it is not completed yet. Current status: ${project.projectStatus}`,
      );
    }
  }

  validateCreateMode(
    existingRating: AccountRatingEntity | null,
    dto: CreateAccountRatingDto,
  ): void {
    const safeMode = dto.mode ?? CreateMode.DEFAULT;
    if (existingRating && safeMode !== CreateMode.RECALCULATED) {
      throw new AccountRatingAlreadyExistsForProjectException(
        dto.accountId,
        dto.projectId,
      );
    }
  }

  mapMetricsSnapshot(
    metrics: AccountRatingMetricsRow | undefined,
  ): RatingMetricsSnapshot {
    return {
      totalFileLabeled: Number(metrics?.totalFileLabeled ?? 0),
      errorCount: Number(metrics?.errorCount ?? 0),
      totalPenalty: Number(metrics?.totalPenalty ?? 0),
    };
  }

  mapReviewErrorBreakdown(
    rows: AccountRatingErrorBreakdownRow[],
  ): ReviewErrorBreakdownSnapshot[] {
    return rows.map((row) => ({
      errorTypeId: row.errorTypeId,
      name: row.name,
      description: row.description,
      severity: row.severity,
      scoreImpact: Number(row.scoreImpact ?? 0),
      count: Number(row.count ?? 0),
      totalImpact: Number(row.totalImpact ?? 0),
    }));
  }

  calculateRatingScore(totalFileLabeled: number, totalPenalty: number): number {
    return totalFileLabeled > 0
      ? Math.max(0, Math.round(100 - totalPenalty / totalFileLabeled))
      : 0;
  }

  mapAccountRatingEntity(
    existingRating: AccountRatingEntity | null,
    dto: CreateAccountRatingDto,
    computedScore: number,
    errorCount: number,
    totalFileLabeled: number,
  ): AccountRatingEntity {
    const entity = existingRating ?? new AccountRatingEntity();
    entity.accountId = dto.accountId;
    entity.projectId = dto.projectId;
    entity.ratingScore = computedScore;
    entity.errorCount = errorCount;
    entity.totalFileLabeled = totalFileLabeled;
    entity.feedbacks = dto.feedbacks || entity.feedbacks || '';
    return entity;
  }

  mapRatingHistoryEntity(
    accountRatingId: string,
    previousRatingScore: number,
    newRatingScore: number,
    dto: CreateAccountRatingDto,
    metrics: RatingMetricsSnapshot,
    reviewErrorBreakdown: ReviewErrorBreakdownSnapshot[],
  ): AccountRatingHistoryEntity {
    const history = new AccountRatingHistoryEntity();
    history.accountRatingId = accountRatingId;
    history.previousRatingScore = previousRatingScore;
    history.newRatingScore = newRatingScore;
    history.changeReason =
      dto.feedbacks ||
      `Recalculated from finalized file labels for project ${dto.projectId}`;
    history.changedAt = new Date();
    history.reviewError = {
      totalFileLabeled: metrics.totalFileLabeled,
      errorCount: metrics.errorCount,
      totalPenalty: metrics.totalPenalty,
      breakdown: reviewErrorBreakdown,
    };
    return history;
  }
}
