import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

export class LabelChecklistQuestionNotFoundException extends NotFoundException {
  constructor(id: string, includeDeleted: boolean = false) {
    super(
      `LabelChecklistQuestion with ID "${id}" not found ${includeDeleted ? '(include soft deleted)' : ''}.`,
    );
  }
}

export class LabelChecklistQuestionAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(
      `LabelChecklistQuestion with identifier "${identifier}" already exists`,
    );
  }
}

export class InvalidLabelChecklistQuestionException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid label-checklist-question: ${message}`);
  }
}

export class LabelReferencedNotFoundToRestoreException extends BadRequestException {
  constructor(labelId: string) {
    super(
      `Label with ID "${labelId}" is not available, cannot restore checklist question, please restore the label first.`,
    );
  }
}

export class CannotDeleteQuestionWithAnswersException extends BadRequestException {
  constructor(id: string, includeDeleted: boolean = false) {
    const message = `Cannot delete checklist question with ID "${id}" because it has associated answers ${includeDeleted ? '(include soft deleted)' : ''}. Please delete or reassign the answers first.`;

    super(message);
  }
}

export class CannotUpdateQuestionRoleException extends BadRequestException {
  constructor() {
    super(
      `Cannot update the role of an existing checklist question. The role is immutable once set.`,
    );
  }
}
