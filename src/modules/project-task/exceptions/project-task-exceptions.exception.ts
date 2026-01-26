import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class ProjectTaskNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`ProjectTask with ID "${id}" not found`);
  }
}

export class ProjectTaskAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`ProjectTask with identifier "${identifier}" already exists`);
  }
}

export class InvalidProjectTaskException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid project-task: ${message}`);
  }
}
