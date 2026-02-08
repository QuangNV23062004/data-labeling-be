import {
  NotFoundException,
  ConflictException,
  BadRequestException,
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

export class FileAccessNotAllowedException extends BadRequestException {
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
