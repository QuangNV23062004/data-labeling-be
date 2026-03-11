import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
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

export class FileLabelPairAlreadyExistsException extends ConflictException {
  constructor(fileId: string, labelId: string) {
    super(
      `File with ID "${fileId}" already has Label with ID "${labelId}" assigned`,
    );
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

export class FileAccessNotAllowedException extends ForbiddenException {
  constructor(message: string) {
    super(
      `File access not allowed: ${message}, you are not assigned to this file as a annotator or reviewer`,
    );
  }
}

export class CannotHardDeleteFileLabelWithChecklistAnswersException extends BadRequestException {
  constructor(id: string) {
    super(
      `Cannot hard delete FileLabel with id ${id} because it has associated checklist answers.`,
    );
  }
}

export class CannotRestoreFileLabelWithDeletedRelationsException extends BadRequestException {
  constructor(id: string) {
    super(
      `Cannot restore FileLabel with id ${id} because its related File or Label is deleted.`,
    );
  }
}

export class FileLabelLifeCycleHasCompletedException extends BadRequestException {
  constructor(id: string, status: string) {
    super(
      `Cannot update FileLabel with id ${id} because its lifecycle has completed with status "${status}".`,
    );
  }
}

export class FileHasAlreadyBeenReassignedToAnotherAnnotatorException extends ConflictException {
  constructor(fileId: string) {
    super(
      `File with ID "${fileId}" has already been reassigned to another annotator.`,
    );
  }
}

export class LabelNotAllowedInProjectException extends BadRequestException {
  constructor(labelId: string, projectId: string) {
    super(
      `Label with ID "${labelId}" is not allowed in Project with ID "${projectId}".`,
    );
  }
}
