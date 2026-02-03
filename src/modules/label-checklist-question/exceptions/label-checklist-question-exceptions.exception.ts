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

export class ParentQuestionNotFoundToRestoreException extends BadRequestException {
  constructor(parentQuestionId: string) {
    super(
      `Parent checklist question with ID "${parentQuestionId}" is not available, cannot restore child checklist question, please restore the parent checklist question first.`,
    );
  }
}

export class CannotDeleteQuestionWithChildrenException extends BadRequestException {
  constructor(id: string, includeDeleted: boolean = false) {
    const message = `Cannot delete checklist question with ID "${id}" because it has child questions ${includeDeleted ? '(include soft deleted)' : ''}. Please delete or reassign the child questions first.`;

    super(message);
  }
}

export class CannotDeleteQuestionWithAnswersException extends BadRequestException {
  constructor(id: string, includeDeleted: boolean = false) {
    const message = `Cannot delete checklist question with ID "${id}" because it has associated answers ${includeDeleted ? '(include soft deleted)' : ''}. Please delete or reassign the answers first.`;

    super(message);
  }
}

export class CannotCreateAnnotatorChecklistQuestionWithParentException extends BadRequestException {
  constructor() {
    super(
      `Cannot create a checklist question with role 'ANNOTATOR' that has a parent question. Annotator questions must be top-level questions without parents.`,
    );
  }
}

export class CannotCreateReviewerChecklistQuestionWithInvalidParentException extends BadRequestException {
  constructor() {
    super(
      `Cannot create a checklist question with role 'REVIEWER' that has a parent question with role other than 'ANNOTATOR'. Reviewer questions must have parent questions that are also assigned to the REVIEWER role.`,
    );
  }
}

export class CannotCreateReviewerChecklistQuestionWithoutParentException extends BadRequestException {
  constructor() {
    super(
      `Cannot create a checklist question with role 'REVIEWER' without a parent question. Reviewer questions must have parent questions that are top-level 'ANNOTATOR' questions.`,
    );
  }
}

export class CannotUpdateAnnotatorChecklistQuestionWithParentException extends BadRequestException {
  constructor() {
    super(
      `Cannot update a checklist question to role 'ANNOTATOR' while it has a parent question. Annotator questions must be top-level questions without parents.`,
    );
  }
}

export class CannotUpdateReviewerChecklistQuestionWithInvalidParentException extends BadRequestException {
  constructor() {
    super(
      `Cannot update a checklist question to role 'REVIEWER' with an invalid parent. Reviewer questions must have parent questions that are top-level 'ANNOTATOR' questions.`,
    );
  }
}

export class CannotUpdateQuestionRoleException extends BadRequestException {
  constructor() {
    super(
      `Cannot update the role of an existing checklist question. The role is immutable once set.`,
    );
  }
}

export class ChildrenLabelIdMustMatchParentLabelIdException extends BadRequestException {
  constructor() {
    super(
      `The label ID of a child checklist question must match the label ID of its parent question.`,
    );
  }
}

export class CannotUpdateChecklistWithChildrenToReviewerChecklistException extends BadRequestException {
  constructor() {
    super(
      `Cannot update a checklist question with child questions to role 'REVIEWER'. Only top-level 'ANNOTATOR' questions can have child questions.`,
    );
  }
}

export class CannotUpdateReviewerChecklistQuestionWithoutParentException extends BadRequestException {
  constructor() {
    super(
      `Cannot update a checklist question to role 'REVIEWER' without a parent question. Reviewer questions must have parent questions that are top-level 'ANNOTATOR' questions.`,
    );
  }
}
