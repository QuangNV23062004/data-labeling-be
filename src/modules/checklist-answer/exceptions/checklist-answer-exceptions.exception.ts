import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from 'src/modules/account/enums/role.enum';
import { AnswerTypeEnum } from '../enums/answer-type.enums';

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

export class InvalidQuestionIdInQuestionDataForThisLabelAndRole extends BadRequestException {
  constructor(role: Role, labelId: string, questionId: string) {
    super(
      `Invalid questionId: ${questionId} provided for this combination of labelId: ${labelId} and role: ${role}`,
    );
  }
}

export class InsufficientAnswerProvidedForRequiredQuestions extends BadRequestException {
  constructor() {
    super('Please provide answer for all required questions');
  }
}

export class ReviewerCannotCreateInitialChecklistAnswer extends BadRequestException {
  constructor(fileLabelId: string) {
    super(
      `Reviewer cannot create initial checklist answer for this ${fileLabelId}`,
    );
  }
}

export class NotInTurnToCreateChecklistAnswer extends BadRequestException {
  constructor(fileLabelId: string, nextRole: string) {
    super(
      `Not in turn to create checklist answer for this file label: ${fileLabelId}, please wait for ${nextRole} to create follow up checklist answer`,
    );
  }
}

export class ChecklistLifeCycleHasCompleted extends BadRequestException {
  constructor(fileLabelId: string) {
    super(
      `Checklist life cycle for this file label: ${fileLabelId} has completed`,
    );
  }
}

export class AnswerTypeNotValidInChecklistLifeCycle extends BadRequestException {
  constructor() {
    super(`Answer type not valid in checklist life cycle`);
  }
}

export class InvalidAnswerTypeForRole extends BadRequestException {
  constructor(answerType: AnswerTypeEnum, role: Role) {
    super(`Answer type ${answerType} not allowed for ${role}`);
  }
}

export class CannotUpdateCheclistAnswerIfApproved extends BadRequestException {
  constructor(id: string) {
    super(
      `Cannot update checklist answer with ID "${id}" because it has been approved`,
    );
  }
}

export class CannotUpdateCheclistAnswerIfNotLatest extends BadRequestException {
  constructor(id: string) {
    super(
      `Cannot update checklist answer with ID "${id}" because it is not the latest attempt in the cycle`,
    );
  }
}

export class OnlyReviewerChecklistSupportUpdateAnswerType extends BadRequestException {
  constructor(id: string) {
    super(
      `Only checklist answers created by Reviewer can update answerType for checklist answer with ID "${id}"`,
    );
  }
}

export class NotAllowedUpdateAnswerTypeInChecklistLifeCycle extends BadRequestException {
  constructor(currentType: AnswerTypeEnum, allowedTypes: AnswerTypeEnum[]) {
    super(
      `Not allowed to update answerType in checklist life cycle, current type is ${currentType}, allowed types are: ${allowedTypes.join(', ')}`,
    );
  }
}

export class CannotMutateOtherUsersChecklistAnswerException extends BadRequestException {
  constructor(id: string) {
    super(
      `Cannot mutate checklist answer with ID "${id}" because it was created by another user`,
    );
  }
}
