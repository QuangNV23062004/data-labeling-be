import { ForbiddenException } from '@nestjs/common';

export class OnlyAdminCanHardDeleteException extends ForbiddenException {
  constructor() {
    super('Only admin accounts can perform hard delete operations.');
  }
}
