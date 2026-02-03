import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

export class FileLabelNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`FileLabel with ID "${id}" not found`);
  }
}

export class FileLabelAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`FileLabel with identifier "${identifier}" already exists`);
  }
}

export class InvalidFileLabelException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid file-label: ${message}`);
  }
}

export class MissingRequiredFileLabelFieldException extends BadRequestException {
  constructor(fieldName: string) {
    super(`Missing required field: ${fieldName}`);
  }
}
