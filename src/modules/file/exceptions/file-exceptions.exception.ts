import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

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

export class FileTypeNotSupportedException extends BadRequestException {
  constructor(fileType: string) {
    super(`File type "${fileType}" is not supported`);
  }
}

export class CannotRestoreFileFromADeletedProjectException extends BadRequestException {
  constructor(fileId: string, projectId: string) {
    super(
      `Cannot restore file with ID "${fileId}" because its associated project with ID "${projectId}" is deleted`,
    );
  }
}

export class CannotRestoreFileFromADeletedProjectTaskException extends BadRequestException {
  constructor(fileId: string, taskId: string) {
    super(
      `Cannot restore file with ID "${fileId}" because its associated project task with ID "${taskId}" is deleted`,
    );
  }
}

export class CannotHardDeleteAProjectWithExistingProjectTasksException extends BadRequestException {
  constructor(fileId: string) {
    super(
      `Cannot hard delete file with ID "${fileId}" because it has existing project tasks associated with files`,
    );
  }
}

export class CannotHardDeleteAFileWithExistingFileLabelsException extends BadRequestException {
  constructor(fileId: string) {
    super(
      `Cannot hard delete file with ID "${fileId}" because it has existing file labels associated`,
    );
  }
}

export class CannotRestoreAFileInsideADeletedProjectException extends BadRequestException {
  constructor(fileId: string, projectId: string) {
    super(
      `Cannot restore file with ID "${fileId}" because its associated project with ID "${projectId}" is deleted`,
    );
  }
}

export class CanOnlyUploadFilesToDraftProjectsException extends BadRequestException {
  constructor(projectId: string) {
    super(
      `Cannot upload files to project with ID "${projectId}" because the project is not in DRAFT status`,
    );
  }
}

export class UnknownFileFormatException extends BadRequestException {
  constructor(format: string) {
    super(`Unknown file format: ${format}`);
  }
}

export class ProjectTypeFileTypeMismatchException extends BadRequestException {
  constructor(projectType: string, fileType: string) {
    super(
      `File type "${fileType}" is not compatible with project type "${projectType}"`,
    );
  }
}
