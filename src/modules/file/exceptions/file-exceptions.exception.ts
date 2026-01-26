import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class FileNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`File with ID "${id}" not found`);
  }
}

export class FileAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`File with identifier "${identifier}" already exists`);
  }
}

export class InvalidFileException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid file: ${message}`);
  }
}
