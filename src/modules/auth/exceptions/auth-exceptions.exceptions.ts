import {
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

export class UnauthorizedAccessException extends UnauthorizedException {
  constructor() {
    super('Unauthorized access');
  }
}

export class InvalidAccessTokenException extends UnauthorizedException {
  constructor() {
    super('Invalid access token');
  }
}

export class AccountNotFoundException extends NotFoundException {
  constructor() {
    super('Account not found');
  }
}

export class AccountInactiveException extends ForbiddenException {
  constructor() {
    super('Account is inactive, please contact administrator');
  }
}

export class InvalidPasswordException extends BadRequestException {
  constructor() {
    super('Invalid password');
  }
}

export class PasswordNotMatchException extends BadRequestException {
  constructor() {
    super('Password not match');
  }
}

export class RefreshTokenNotFoundException extends UnauthorizedException {
  constructor() {
    super('Refresh token not found');
  }
}

export class InvalidRefreshTokenException extends UnauthorizedException {
  constructor() {
    super('Invalid refresh token');
  }
}

export class InsufficientPermissionException extends ForbiddenException {
  constructor() {
    super('Insufficient permission to perform this action');
  }
}

export class ResetPasswordTokenNotFoundException extends NotFoundException {
  constructor() {
    super('Reset password token not found');
  }
}

export class InvalidResetPasswordTokenException extends UnauthorizedException {
  constructor() {
    super('Invalid reset password token');
  }
}

export class ResetTokenNotUsableException extends ForbiddenException {
  constructor() {
    super(
      'Reset password token is no longer usable, please use the latest token provided',
    );
  }
}

export class FailedToSendResetPasswordEmailException extends InternalServerErrorException {
  constructor() {
    super('Failed to send email, please try again later');
  }
}

export class PasswordNotStrongEnoughException extends BadRequestException {
  constructor() {
    super(
      'Password is not strong enough: it must be at least 8 characters long it must include uppercase letters, lowercase letters,numbers, and special characters.',
    );
  }
}
