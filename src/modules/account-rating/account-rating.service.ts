import { Injectable } from '@nestjs/common';
import { AccountRatingRepository } from './account-rating.repository';
import { BaseService } from 'src/common/service/base.service';
import { CreateAccountRatingDto } from './dtos/create-account-rating.dto';
import { AccountRatingNotFoundException } from './exceptions/account-rating-exceptions.exception';
import { AccountRepository } from '../account/account.repository';
import { ProjectRepository } from '../project/project.repository';
import { AccountInfo } from 'src/interfaces/request/authenticated-request.interface';
import { FilterAccountRatingQueryDto } from './dtos/filter-account-rating-query.dto';
import { FileLabelRepository } from '../file-label/file-label.repository';
import { AccountRatingHistoryRepository } from '../account-rating-history/account-rating-history.repository';
import { AccountRatingDomain } from './account-rating.domain';
import { CreateMode } from './enums/create-mode.enums';

//computed => no update
@Injectable()
export class AccountRatingService extends BaseService {
  constructor(
    private readonly accountRatingRepository: AccountRatingRepository,
    private readonly accountRepository: AccountRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly fileLabelRepository: FileLabelRepository,
    private readonly accountRatingHistoryRepository: AccountRatingHistoryRepository,
    private readonly accountRatingDomain: AccountRatingDomain,
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
      this.accountRatingDomain.validateAccountExists(account);

      const project = await this.projectRepository.FindById(
        dto.projectId,
        false,
        transactionalEntityManager,
      );

      const existingRating =
        await this.accountRatingRepository.FindByAccountAndProject(
          dto.accountId,
          dto.projectId,
          false,
          transactionalEntityManager,
        );
      this.accountRatingDomain.validateProjectExists(project, dto.projectId);
      this.accountRatingDomain.validateProjectCompleted(
        project!,
        dto.projectId,
      );
      this.accountRatingDomain.validateCreateMode(existingRating, dto);

      if (existingRating && dto.mode === CreateMode.RECALCULATED) {
        await this.accountRatingRepository.SoftDelete(
          existingRating.id,
          transactionalEntityManager,
        );
      }
      const metricsRow =
        await this.fileLabelRepository.FindAccountRatingMetrics(
          dto.projectId,
          dto.accountId,
          transactionalEntityManager,
        );

      const reviewErrorBreakdownRows =
        await this.fileLabelRepository.FindAccountRatingErrorBreakdown(
          dto.projectId,
          dto.accountId,
          transactionalEntityManager,
        );

      const metrics = this.accountRatingDomain.mapMetricsSnapshot(metricsRow);
      const reviewErrorBreakdown =
        this.accountRatingDomain.mapReviewErrorBreakdown(
          reviewErrorBreakdownRows,
        );
      const computedScore = this.accountRatingDomain.calculateRatingScore(
        metrics.totalFileLabeled,
        metrics.totalPenalty,
      );

      const previousRatingScore = existingRating?.ratingScore ?? 0;

      const ratingEntity = this.accountRatingDomain.mapAccountRatingEntity(
        existingRating,
        dto,
        computedScore,
        metrics.errorCount,
        metrics.totalFileLabeled,
      );

      const accountRating = existingRating
        ? await this.accountRatingRepository.Update(
            ratingEntity,
            transactionalEntityManager,
          )
        : await this.accountRatingRepository.Create(
            ratingEntity,
            transactionalEntityManager,
          );

      const historyEntity = this.accountRatingDomain.mapRatingHistoryEntity(
        accountRating.id,
        previousRatingScore,
        accountRating.ratingScore,
        dto,
        metrics,
        reviewErrorBreakdown,
      );

      await this.accountRatingHistoryRepository.Create(
        historyEntity,
        transactionalEntityManager,
      );

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
