import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class ReviewChecklistSubmissionNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`ReviewChecklistSubmission with ID "${id}" not found`);
  }
}

export class ReviewChecklistSubmissionAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`ReviewChecklistSubmission with identifier "${identifier}" already exists`);
  }
}

export class InvalidReviewChecklistSubmissionException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid review-checklist-submission: ${message}`);
  }
}
