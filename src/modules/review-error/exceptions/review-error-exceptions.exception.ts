import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

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
