import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class ReviewErrorTypeNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`ReviewErrorType with ID "${id}" not found`);
  }
}

export class ReviewErrorTypeAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`ReviewErrorType with identifier "${identifier}" already exists`);
  }
}

export class InvalidReviewErrorTypeException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid review-error-type: ${message}`);
  }
}
