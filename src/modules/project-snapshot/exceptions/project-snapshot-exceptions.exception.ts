import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class ProjectSnapshotNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`ProjectSnapshot with ID "${id}" not found`);
  }
}

export class ProjectSnapshotAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`ProjectSnapshot with identifier "${identifier}" already exists`);
  }
}

export class InvalidProjectSnapshotException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid project-snapshot: ${message}`);
  }
}
