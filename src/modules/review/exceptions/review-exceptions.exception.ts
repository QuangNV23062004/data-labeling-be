import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

export class ReviewNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Review with ID "${id}" not found`);
  }
}

export class ReviewAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`Review with identifier "${identifier}" already exists`);
  }
}

export class InvalidReviewException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid review: ${message}`);
  }
}

export class CannotUpdateOtherReviewerException extends BadRequestException {
  constructor() {
    super(`Cannot update review assigned to another reviewer`);
  }
}

export class CannotDeleteOtherReviewerException extends BadRequestException {
  constructor() {
    super(`Cannot delete review assigned to another reviewer`);
  }
}

export class CannotDeleteApprovedReviewException extends BadRequestException {
  constructor() {
    super(`Cannot delete a review that has already been approved`);
  }
}

export class CannotRestoreReviewWithDeletedChecklistAnswerException extends BadRequestException {
  constructor(checklistAnswerId: string) {
    super(
      `Cannot restore review because its associated checklist answer with ID "${checklistAnswerId}" has been deleted`,
    );
  }
}

export class CannotHardDeleteReviewWithErrorsException extends BadRequestException {
  constructor(reviewId: string) {
    super(
      `Cannot hard delete review with ID "${reviewId}" because it has associated review errors`,
    );
  }
}

export class ReviewDecisionConflictException extends ConflictException {
  constructor(reviewDecision: string, checklistAnswerDecision: string) {
    super(
      `Review decision "${reviewDecision}" conflicts with checklist answer decision "${checklistAnswerDecision}"`,
    );
  }
}

export class CannotCreateReviewLinkedToAnnotatorChecklistAnswerException extends BadRequestException {
  constructor() {
    super(
      `Cannot create review linked to a checklist answer created by an annotator`,
    );
  }
}

export class CannotUpdateApprovedReviewException extends BadRequestException {
  constructor() {
    super(`Cannot update a review that has already been approved`);
  }
}

export class ReviewForThisChecklistAnswerAlreadyExistsException extends ConflictException {
  constructor(checklistAnswerId: string) {
    super(
      `A review for checklist answer with ID "${checklistAnswerId}" already exists`,
    );
  }
}
