import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class LabelChecklistQuestionNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`LabelChecklistQuestion with ID "${id}" not found`);
  }
}

export class LabelChecklistQuestionAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`LabelChecklistQuestion with identifier "${identifier}" already exists`);
  }
}

export class InvalidLabelChecklistQuestionException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid label-checklist-question: ${message}`);
  }
}
