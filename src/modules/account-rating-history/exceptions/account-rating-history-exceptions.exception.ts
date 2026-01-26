import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class AccountRatingHistoryNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`AccountRatingHistory with ID "${id}" not found`);
  }
}

export class AccountRatingHistoryAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`AccountRatingHistory with identifier "${identifier}" already exists`);
  }
}

export class InvalidAccountRatingHistoryException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid account-rating-history: ${message}`);
  }
}
