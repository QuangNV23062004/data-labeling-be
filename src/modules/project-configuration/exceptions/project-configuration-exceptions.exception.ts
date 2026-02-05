import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class ProjectConfigurationNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`ProjectConfiguration with ID "${id}" not found`);
  }
}

export class ProjectConfigurationAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`ProjectConfiguration with identifier "${identifier}" already exists`);
  }
}

export class InvalidProjectConfigurationException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid project-configuration: ${message}`);
  }
}

export class InvalidProjectIdException extends NotFoundException {
  constructor(projectId: string) {
    super(`Project with ID "${projectId}" not found`);
  }
}

export class InvalidLabelIdsException extends NotFoundException {
  constructor(labelIds: string[]) {
    super(`The following label IDs were not found: ${labelIds.join(', ')}`);
  }
}
