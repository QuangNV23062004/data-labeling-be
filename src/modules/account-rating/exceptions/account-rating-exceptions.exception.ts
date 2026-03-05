import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

export class AccountRatingNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`AccountRating with ID "${id}" not found`);
  }
}

export class AccountRatingAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`AccountRating with identifier "${identifier}" already exists`);
  }
}

export class AccountRatingAlreadyExistsForProjectException extends ConflictException {
  constructor(accountId: string, projectId: string) {
    super(
      `AccountRating already exists for account "${accountId}" in project "${projectId}". Use mode "RECALCULATED" to update this rating.`,
    );
  }
}

export class InvalidAccountRatingException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid account-rating: ${message}`);
  }
}
