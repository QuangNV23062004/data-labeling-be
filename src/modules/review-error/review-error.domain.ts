import { Injectable } from '@nestjs/common';
import { ReviewEntity } from '../review/review.entity';
import { ReviewNotFoundException } from '../review/exceptions/review-exceptions.exception';
import {
  ReviewerIdMismatchForReviewErrorException,
  ReviewErrorCannotBeMutatedException,
  ReviewErrorNotFoundException,
} from './exceptions/review-error-exceptions.exception';
import { Decision } from '../review/enums/decisions.enums';
import { CreateReviewErrorDto } from './dtos/create-review-error.dto';
import { AccountInfo } from 'src/interfaces/request';
import { Role } from '../account/enums/role.enum';
import { ReviewErrorTypeNotFoundException } from '../review-error-type/exceptions/review-error-type-exceptions.exception';
import { ReviewErrorTypeEntity } from '../review-error-type/review-error-type.entity';
import { ReviewErrorEntity } from './review-error.entity';

/**
 * Domain service containing business logic and validation rules for ReviewError entity.
 * Implements domain-driven design principles by centralizing business rules.
 */
@Injectable()
export class ReviewErrorDomain {
  /**
   * Checks if the current user has permission to modify a review.
   * Business rules:
   * - The review owner (reviewer) can always modify their review errors
   * - Admins can modify any review errors
   * - Other users cannot modify review errors
   *
   * @param accountInfo - Current user's account information
   * @param reviewerId - ID of the reviewer who owns the review
   * @returns true if user has permission to modify the review
   */
  private hasPermissionToModifyReview(
    accountInfo: AccountInfo | undefined,
    reviewerId: string,
  ): boolean {
    if (!accountInfo) {
      return false;
    }

    // Admin users can modify any review
    if (accountInfo.role === Role.ADMIN) {
      return true;
    }

    // Review owner can modify their own review
    return accountInfo.sub === reviewerId;
  }

  /**
   * Validates that a review exists and the current user has permission to modify it.
   * This is a critical business rule that ensures data integrity and access control.
   *
   * Business rules enforced:
   * 1. Review must exist in the system
   * 2. Only the review owner or admin can create/modify review errors
   * 3. Approved reviews cannot have errors added/modified (enforced separately)
   *
   * @param dto - The review error DTO containing reviewId
   * @param review - The review entity to validate (loaded from database)
   * @param accountInfo - Current user's account information
   * @throws {ReviewNotFoundException} When review doesn't exist
   * @throws {ReviewerIdMismatchForReviewErrorException} When user lacks permission
   */
  validateReviewAccess(
    dto: CreateReviewErrorDto,
    review: ReviewEntity | null | undefined,
    accountInfo?: AccountInfo,
  ): void {
    // Business Rule: Review must exist
    if (!review) {
      throw new ReviewNotFoundException(dto.reviewId);
    }

    // Business Rule: Only reviewer or admin can modify review errors
    if (!this.hasPermissionToModifyReview(accountInfo, review.reviewerId)) {
      throw new ReviewerIdMismatchForReviewErrorException(
        review.id,
        accountInfo?.sub || 'anonymous',
        review.reviewerId,
      );
    }
  }

  /**
   * Validates that review errors can be mutated based on the review's decision status.
   * This implements the core business rule about review finality.
   *
   * Business rules:
   * - PENDING reviews: Errors can be freely added/modified/deleted (work in progress)
   * - REJECTED reviews: Errors can be added/modified (allows fixing issues)
   * - APPROVED reviews: Errors are locked (review is final and complete)
   *
   * @param decision - Current decision status of the review
   * @param reviewId - ID of the review (for error context)
   * @param mode - Type of operation being attempted
   * @throws {ReviewErrorCannotBeMutatedException} When review is in final approved state
   */
  validateReviewMutability(
    decision: Decision | null | undefined,
    reviewId: string,
    mode: 'create' | 'update' | 'delete' | 'restore' = 'update',
  ): void {
    // Business Rule: Approved reviews are immutable
    // Once approved, the review is considered final and complete
    if (decision === Decision.APPROVED) {
      throw new ReviewErrorCannotBeMutatedException(
        '', // Empty ID for creation, actual ID for updates
        reviewId,
        Decision.APPROVED,
        mode,
      );
    }

    // Note: REJECTED and PENDING reviews allow error mutations
    // - PENDING: Review is still in progress
    // - REJECTED: Allows adding errors to explain rejection reasons
  }

  /**
   * Validates that a review error type exists and is available for use.
   * This ensures referential integrity for the review error categorization.
   *
   * @param reviewErrorType - The error type entity to validate
   * @param dto - The DTO containing the error type ID for context
   * @throws {ReviewErrorTypeNotFoundException} When error type doesn't exist
   */
  validateReviewErrorType(
    reviewErrorType: ReviewErrorTypeEntity | null | undefined,
    dto: CreateReviewErrorDto,
  ): void {
    if (!reviewErrorType) {
      throw new ReviewErrorTypeNotFoundException(dto.reviewErrorTypeId);
    }
  }

  /**
   * Validates that a review error entity exists.
   * Basic existence check for update/delete/restore operations.
   *
   * @param reviewError - The review error entity to validate
   * @param id - The ID being searched for (used in error message)
   * @throws {ReviewErrorNotFoundException} When review error doesn't exist
   */
  validateReviewErrorExists(
    reviewError: ReviewErrorEntity | null | undefined,
    id: string,
  ): void {
    if (!reviewError) {
      throw new ReviewErrorNotFoundException(id);
    }
  }

  /**
   * Validates that a review error can be modified based on its parent review's status.
   * This is used for update/delete/restore operations on existing review errors.
   *
   * @param reviewError - The review error entity being modified
   * @param mode - Type of operation being attempted
   * @throws {ReviewErrorCannotBeMutatedException} When parent review is approved
   */
  validateReviewErrorMutability(
    reviewError: ReviewErrorEntity,
    mode: 'update' | 'delete' | 'restore' = 'update',
  ): void {
    // Check if the parent review allows mutations
    this.validateReviewMutability(
      reviewError?.review?.decision,
      reviewError?.review?.id || reviewError.reviewId,
      mode,
    );
  }
}
