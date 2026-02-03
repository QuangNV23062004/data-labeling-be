import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

export class AccountNotFoundException extends NotFoundException {
  constructor() {
    super('Account not found');
  }
}

export class EmailInUseException extends BadRequestException {
  constructor() {
    super('Email already in use');
  }
}

export class InsufficientPermissionException extends ForbiddenException {
  constructor() {
    super(
      'You do not have sufficient permission to perform actions in this lists: update roles, statuses, delete other people account',
    );
  }
}

export class CannotUpdateOtherAccountException extends ForbiddenException {
  constructor() {
    super('Only admin can update other user accounts');
  }
}

export class FailedToBootstrapAdminAccountException extends InternalServerErrorException {
  constructor() {
    super('Failed to bootstrap admin account');
  }
}
