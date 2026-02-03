import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class ChecklistAnswerNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`ChecklistAnswer with ID "${id}" not found`);
  }
}

export class ChecklistAnswerAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`ChecklistAnswer with identifier "${identifier}" already exists`);
  }
}

export class InvalidChecklistAnswerException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid checklist-answer: ${message}`);
  }
}
