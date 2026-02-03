import { Injectable } from '@nestjs/common';
import { ReviewErrorTypeRepository } from './review-error-type.repository';
import { CreateReviewErrorTypeDto } from './dtos/create-review-error-type.dto';
import { UpdateReviewErrorTypeDto } from './dtos/update-review-error-type.dto';
import { FilterReviewErrorTypeQueryDto } from './dtos/filter-review-error-type-query.dto';
import { ReviewErrorTypeEntity } from './review-error-type.entity';
import { AccountInfo } from 'src/interfaces/request';
import {
  ReviewErrorTypeNotFoundException,
  ReviewErrorTypeAlreadyExistsException,
} from './exceptions/review-error-type-exceptions.exception';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { BaseService } from 'src/common/service/base.service';

@Injectable()
export class ReviewErrorTypeService extends BaseService {
  constructor(
    private readonly reviewErrorTypeRepository: ReviewErrorTypeRepository,
  ) {
    super();
  }

  async Create(
    createReviewErrorTypeDto: CreateReviewErrorTypeDto,
    accountInfo?: AccountInfo,
  ): Promise<ReviewErrorTypeEntity> {
    const em = await this.reviewErrorTypeRepository.GetEntityManager();

    return await em.transaction(async (transactionalEntityManager) => {
      const existingReviewErrorType =
        await this.reviewErrorTypeRepository.FindByName(
          createReviewErrorTypeDto.name,
          false,
          '',
          transactionalEntityManager,
        );
      if (existingReviewErrorType) {
        throw new ReviewErrorTypeAlreadyExistsException(
          createReviewErrorTypeDto.name,
        );
      }

      const newReviewErrorType: ReviewErrorTypeEntity = Object.assign(
        new ReviewErrorTypeEntity(),
        createReviewErrorTypeDto,
      );
      const reviewErrorType = this.reviewErrorTypeRepository.Create(
        newReviewErrorType,
        transactionalEntityManager,
      );
      return reviewErrorType;
    });
  }

  async FindById(
    id: string,
    includeDeleted = false,
    accountInfo?: AccountInfo,
  ): Promise<ReviewErrorTypeEntity> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    const reviewErrorType = await this.reviewErrorTypeRepository.FindById(
      id,
      safeIncludedDeleted,
    );
    if (!reviewErrorType) {
      throw new ReviewErrorTypeNotFoundException(id);
    }
    return reviewErrorType;
  }

  async FindAll(
    query: FilterReviewErrorTypeQueryDto,
    includeDeleted = false,
    accountInfo?: AccountInfo,
  ): Promise<ReviewErrorTypeEntity[]> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.reviewErrorTypeRepository.FindAll(query, safeIncludedDeleted);
  }

  async FindPaginated(
    query: FilterReviewErrorTypeQueryDto,
    includeDeleted = false,
    accountInfo?: AccountInfo,
  ): Promise<PaginationResultDto<ReviewErrorTypeEntity>> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.reviewErrorTypeRepository.FindPaginated(
      query,
      safeIncludedDeleted,
    );
  }

  async Update(
    id: string,
    updateReviewErrorTypeDto: UpdateReviewErrorTypeDto,
    accountInfo?: AccountInfo,
  ): Promise<ReviewErrorTypeEntity> {
    const em = await this.reviewErrorTypeRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const reviewErrorType = await this.reviewErrorTypeRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      if (!reviewErrorType) {
        throw new ReviewErrorTypeNotFoundException(id);
      }

      if (
        updateReviewErrorTypeDto.name &&
        updateReviewErrorTypeDto.name !== reviewErrorType.name
      ) {
        const existingReviewErrorType =
          await this.reviewErrorTypeRepository.FindByName(
            updateReviewErrorTypeDto.name,
            false,
            id,
            transactionalEntityManager,
          );
        if (existingReviewErrorType) {
          throw new ReviewErrorTypeAlreadyExistsException(
            updateReviewErrorTypeDto.name,
          );
        }
        reviewErrorType.name = updateReviewErrorTypeDto.name;
      }

      if (updateReviewErrorTypeDto.description !== undefined) {
        reviewErrorType.description = updateReviewErrorTypeDto.description;
      }

      if (updateReviewErrorTypeDto.severity) {
        reviewErrorType.severity = updateReviewErrorTypeDto.severity;
      }

      if (updateReviewErrorTypeDto.scoreImpact !== undefined) {
        reviewErrorType.scoreImpact = updateReviewErrorTypeDto.scoreImpact;
      }

      return this.reviewErrorTypeRepository.Update(
        reviewErrorType,
        transactionalEntityManager,
      );
    });
  }

  async SoftDelete(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    const em = await this.reviewErrorTypeRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const reviewErrorType = await this.reviewErrorTypeRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );
      if (!reviewErrorType) {
        throw new ReviewErrorTypeNotFoundException(id);
      }

      return this.reviewErrorTypeRepository.SoftDelete(
        id,
        transactionalEntityManager,
      );
    });
  }

  async Restore(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    const em = await this.reviewErrorTypeRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const reviewErrorType = await this.reviewErrorTypeRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );
      if (!reviewErrorType) {
        throw new ReviewErrorTypeNotFoundException(id);
      }

      return this.reviewErrorTypeRepository.Restore(
        id,
        transactionalEntityManager,
      );
    });
  }

  async HardDelete(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    this.validateAdminForHardDelete(accountInfo);

    const em = await this.reviewErrorTypeRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const reviewErrorType = await this.reviewErrorTypeRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );
      if (!reviewErrorType) {
        throw new ReviewErrorTypeNotFoundException(id);
      }

      return this.reviewErrorTypeRepository.HardDelete(
        id,
        transactionalEntityManager,
      );
    });
  }
}
