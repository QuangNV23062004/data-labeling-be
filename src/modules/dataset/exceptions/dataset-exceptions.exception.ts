import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class DatasetNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Dataset with ID "${id}" not found`);
  }
}

export class DatasetAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`Dataset with identifier "${identifier}" already exists`);
  }
}

export class InvalidDatasetException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid dataset: ${message}`);
  }
}
