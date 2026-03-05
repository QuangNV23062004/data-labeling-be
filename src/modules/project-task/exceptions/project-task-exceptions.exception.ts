import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

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

export class UserNotFoundException extends NotFoundException {
  constructor(userId: string, userType: string) {
    super(`${userType} with ID "${userId}" not found`);
  }
}

export class MultipleFilesNotFoundException extends BadRequestException {
  constructor(fileIds: string[]) {
    super(`The following file IDs were not found: ${fileIds.join(', ')}`);
  }
}

export class FailedToAssignUserToFile extends InternalServerErrorException {
  constructor(userId: string, fileIds: string[]) {
    super(`Failed to assign user ${userId} to list of files in ${fileIds}`);
  }
}
