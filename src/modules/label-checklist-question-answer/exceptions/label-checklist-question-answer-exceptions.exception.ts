import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class LabelChecklistQuestionAnswerNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`LabelChecklistQuestionAnswer with ID "${id}" not found`);
  }
}

export class LabelChecklistQuestionAnswerAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`LabelChecklistQuestionAnswer with identifier "${identifier}" already exists`);
  }
}

export class InvalidLabelChecklistQuestionAnswerException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid label-checklist-question-answer: ${message}`);
  }
}
