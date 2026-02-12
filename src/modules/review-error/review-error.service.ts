import { Injectable } from '@nestjs/common';
import { ReviewErrorRepository } from './review-error.repository';
import { AccountInfo } from 'src/interfaces/request';
import { BaseService } from 'src/common/service/base.service';
import { FilterReviewErrorQueryDto } from './dtos/filter-review-error-query.dto';
import { ReviewRepository } from '../review/review.repository';
import { CreateReviewErrorDto } from './dtos/create-review-error.dto';
import { ReviewErrorEntity } from './review-error.entity';
import { CannotRestoreReviewErrorException } from './exceptions/review-error-exceptions.exception';
import { UpdateReviewErrorDto } from './dtos/update-review-error.dto';
import { ReviewErrorTypeRepository } from '../review-error-type/review-error-type.repository';
import { ReviewErrorDomain } from './review-error.domain';

@Injectable()
export class ReviewErrorService extends BaseService {
  constructor(
    private readonly reviewErrorRepository: ReviewErrorRepository,
    private readonly reviewRepository: ReviewRepository,
    private readonly reviewErrorTypeRepository: ReviewErrorTypeRepository,
    private readonly reviewErrorDomain: ReviewErrorDomain,
  ) {
    super();
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ) {
    const safeIncludeDeleted = await this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.reviewErrorRepository.FindById(id, safeIncludeDeleted);
  }

  async FindAll(
    query: FilterReviewErrorQueryDto,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ) {
    const safeIncludeDeleted = await this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.reviewErrorRepository.FindAll(query, safeIncludeDeleted);
  }

  async FindPaginated(
    query: FilterReviewErrorQueryDto,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ) {
    const safeIncludeDeleted = await this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.reviewErrorRepository.FindPaginated(query, safeIncludeDeleted);
  }

  async Create(dto: CreateReviewErrorDto, accountInfo?: AccountInfo) {
    const em = await this.reviewErrorRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      // Load the parent review to validate access and business rules
      const review = await this.reviewRepository.FindById(
        dto.reviewId,
        false,
        transactionalEntityManager,
      );

      // Validate user permission and review existence
      this.reviewErrorDomain.validateReviewAccess(dto, review, accountInfo);

      // Validate that the review allows error creation (not approved)
      this.reviewErrorDomain.validateReviewMutability(
        review?.decision,
        dto.reviewId,
        'create',
      );

      // Validate that the error type exists
      const reviewErrorType = await this.reviewErrorTypeRepository.FindById(
        dto.reviewErrorTypeId,
        false,
        transactionalEntityManager,
      );
      this.reviewErrorDomain.validateReviewErrorType(reviewErrorType, dto);

      // Create and save the review error
      const entity = new ReviewErrorEntity();
      Object.assign(entity, dto);

      return this.reviewErrorRepository.Create(
        entity,
        transactionalEntityManager,
      );
    });
  }

  async Update(
    id: string,
    dto: UpdateReviewErrorDto,
    accountInfo?: AccountInfo,
  ) {
    const em = await this.reviewErrorRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      // Load the existing review error with its relations
      const entity = await this.reviewErrorRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      // Validate that the review error exists
      this.reviewErrorDomain.validateReviewErrorExists(entity, id);

      // Validate that the review error can be modified (review not approved)
      this.reviewErrorDomain.validateReviewErrorMutability(entity!, 'update');

      // If changing the parent review, validate the new review
      if (dto.reviewId && entity!.reviewId !== dto.reviewId) {
        const newReview = await this.reviewRepository.FindById(
          dto.reviewId,
          false,
          transactionalEntityManager,
        );

        // Validate access to the new review
        this.reviewErrorDomain.validateReviewAccess(
          { reviewId: dto.reviewId } as CreateReviewErrorDto,
          newReview,
          accountInfo,
        );

        // Validate that the new review allows error modifications
        this.reviewErrorDomain.validateReviewMutability(
          newReview?.decision,
          dto.reviewId,
          'update',
        );

        entity!.reviewId = dto.reviewId;
      }

      // If changing the error type, validate the new error type
      if (
        dto.reviewErrorTypeId &&
        entity!.reviewErrorTypeId !== dto.reviewErrorTypeId
      ) {
        const reviewErrorType = await this.reviewErrorTypeRepository.FindById(
          dto.reviewErrorTypeId,
          false,
          transactionalEntityManager,
        );

        this.reviewErrorDomain.validateReviewErrorType(reviewErrorType, {
          reviewErrorTypeId: dto.reviewErrorTypeId,
        } as CreateReviewErrorDto);

        entity!.reviewErrorTypeId = dto.reviewErrorTypeId;
      }

      // Apply the updates and save
      Object.assign(entity!, dto);
      return this.reviewErrorRepository.Update(
        entity!,
        transactionalEntityManager,
      );
    });
  }

  async SoftDelete(id: string, accountInfo?: AccountInfo) {
    const em = await this.reviewErrorRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      // Load the review error with its relations
      const entity = await this.reviewErrorRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      // Validate that the review error exists
      this.reviewErrorDomain.validateReviewErrorExists(entity, id);

      // Validate that the review error can be deleted (review not approved)
      this.reviewErrorDomain.validateReviewErrorMutability(entity!, 'delete');

      return this.reviewErrorRepository.SoftDelete(
        id,
        transactionalEntityManager,
      );
    });
  }

  async Restore(id: string, accountInfo?: AccountInfo) {
    const em = await this.reviewErrorRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      // Load the review error including soft-deleted records
      const entity = await this.reviewErrorRepository.FindById(
        id,
        true, // Include deleted to find the soft-deleted review error
        transactionalEntityManager,
      );

      // Validate that the review error exists (even if soft-deleted)
      this.reviewErrorDomain.validateReviewErrorExists(entity, id);

      // Validate that the review error can be restored (review not approved)
      this.reviewErrorDomain.validateReviewErrorMutability(entity!, 'restore');

      // Business Rule: Cannot restore if parent review is deleted
      if (entity!.review?.deletedAt !== null) {
        throw new CannotRestoreReviewErrorException(
          id,
          'review',
          entity!.reviewId,
        );
      }

      // Business Rule: Cannot restore if error type is deleted
      if (entity!.reviewErrorType?.deletedAt !== null) {
        throw new CannotRestoreReviewErrorException(
          id,
          'error type',
          entity!.reviewErrorTypeId,
        );
      }

      return this.reviewErrorRepository.Restore(id, transactionalEntityManager);
    });
  }

  async HardDelete(id: string, accountInfo?: AccountInfo) {
    // Business Rule: Only admins can perform hard deletes
    this.validateAdminForHardDelete(accountInfo);

    const em = await this.reviewErrorRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      // Load the review error including soft-deleted records
      const entity = await this.reviewErrorRepository.FindById(
        id,
        true, // Include deleted records for hard delete
        transactionalEntityManager,
      );

      // Validate that the review error exists
      this.reviewErrorDomain.validateReviewErrorExists(entity, id);

      // Note: Hard delete bypasses business rules about approved reviews
      // since it's an admin operation for data cleanup
      return this.reviewErrorRepository.HardDelete(
        id,
        transactionalEntityManager,
      );
    });
  }
}
