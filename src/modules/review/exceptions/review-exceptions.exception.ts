import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

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
