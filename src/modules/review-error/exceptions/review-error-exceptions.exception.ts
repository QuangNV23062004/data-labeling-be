import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

export class ReviewErrorNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`ReviewError with ID "${id}" not found`);
  }
}

export class ReviewErrorAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`ReviewError with identifier "${identifier}" already exists`);
  }
}

export class InvalidReviewErrorException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid review-error: ${message}`);
  }
}

export class ReviewerIdMismatchForReviewErrorException extends BadRequestException {
  constructor(
    reviewId: string,
    reviewerId: string,
    expectedReviewerId: string,
  ) {
    super(
      `Reviewer ID "${reviewerId}" does not match for Review ID "${reviewId}" 's reviewer: "${expectedReviewerId}".`,
    );
  }
}

export class ReviewErrorCannotBeMutatedException extends BadRequestException {
  constructor(
    id: string,
    reviewId: string,
    status: string,
    mode: 'create' | 'update' | 'delete' | 'restore' = 'update',
  ) {
    super(
      `ReviewError"${id ? ` with ID  ${id}` : ''}" cannot be ${mode}d because its review with ID "${reviewId}" has been ${status}.`,
    );
  }
}

export class CannotRestoreReviewErrorException extends BadRequestException {
  constructor(id: string, type: 'review' | 'error type', typeId: string) {
    super(
      `Cannot restore ReviewError with ID "${id}" linked to deleted ${type} with ID: ${typeId}.`,
    );
  }
}
