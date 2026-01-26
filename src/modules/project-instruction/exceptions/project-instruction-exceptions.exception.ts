import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class ProjectInstructionNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`ProjectInstruction with ID "${id}" not found`);
  }
}

export class ProjectInstructionAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`ProjectInstruction with identifier "${identifier}" already exists`);
  }
}

export class InvalidProjectInstructionException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid project-instruction: ${message}`);
  }
}
