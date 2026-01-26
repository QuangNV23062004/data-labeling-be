import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class ProjectNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Project with ID "${id}" not found`);
  }
}

export class ProjectAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`Project with identifier "${identifier}" already exists`);
  }
}

export class InvalidProjectException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid project: ${message}`);
  }
}
