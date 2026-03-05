import { Injectable } from '@nestjs/common';
import { FileEntity } from '../file/file.entity';
import { FileNotFoundException } from '../file/exceptions/file-exceptions.exception';
import { LabelNotFoundException } from '../label/exceptions/label-exceptions.exceptions';
import { LabelEntity } from '../label/label.entity';
import {
  CannotHardDeleteFileLabelWithChecklistAnswersException,
  CannotRestoreFileLabelWithDeletedRelationsException,
  FileAccessNotAllowedException,
  FileHasAlreadyBeenReassignedToAnotherAnnotatorException,
  FileLabelLifeCycleHasCompletedException,
  FileLabelNotFoundException,
  FileLabelPairAlreadyExistsException,
} from './exceptions/file-label-exceptions.exception';
import { Role } from '../account/enums/role.enum';
import { FileLabelEntity } from './file-label.entity';
import { FileLabelStatusEnums } from './enums/file-label.enums';

@Injectable()
export class FileLabelDomain {
  validateFileExist(file: FileEntity | null, fileId: string): void {
    if (!file) {
      throw new FileNotFoundException(fileId);
    }
  }

  validateFileLabelNotReassigned(existingFileLabel: FileLabelEntity): void {
    if (
      existingFileLabel &&
      existingFileLabel.status === FileLabelStatusEnums.REASSIGNED
    ) {
      throw new FileHasAlreadyBeenReassignedToAnotherAnnotatorException(
        existingFileLabel.fileId,
      );
    }
  }

  validateLabelExist(label: LabelEntity | null): void {
    if (!label) {
      throw new LabelNotFoundException(); // You can create a custom exception for this
    }
  }

  validateFileAccess(file: FileEntity, accountInfo?: any): void {
    if (
      file!.annotatorId !== accountInfo?.sub &&
      file!.reviewerId !== accountInfo?.sub &&
      accountInfo?.role !== Role.ADMIN
    ) {
      throw new FileAccessNotAllowedException(file!.id);
    }
  }

  validateExistingFileLabel(
    existingFileLabel: any,
    fileId: string,
    labelId: string,
  ): void {
    if (existingFileLabel) {
      throw new FileLabelPairAlreadyExistsException(fileId, labelId);
    }
  }

  validateFileLabelNotFound(
    fileLabel: FileLabelEntity | null,
    id: string,
  ): void {
    if (!fileLabel) {
      throw new FileLabelNotFoundException(id);
    }
  }

  validateFileLabelHasChecklistAnswers(
    fileLabel: FileLabelEntity,
    id: string,
  ): void {
    if (fileLabel?.checklistAnswers && fileLabel.checklistAnswers.length > 0) {
      throw new CannotHardDeleteFileLabelWithChecklistAnswersException(id);
    }
  }

  validateLinkedFileAndLabelNotDeleted(
    fileLabel: FileLabelEntity,
    id: string,
  ): void {
    if (fileLabel?.file?.deletedAt !== null) {
      throw new CannotRestoreFileLabelWithDeletedRelationsException(id);
    }

    if (fileLabel?.label?.deletedAt !== null) {
      throw new CannotRestoreFileLabelWithDeletedRelationsException(id);
    }
  }

  validateFileLabelLifeCycleNotCompleted(
    existingFileLabel: FileLabelEntity,
  ): void {
    if (existingFileLabel.status === FileLabelStatusEnums.APPROVED) {
      throw new FileLabelLifeCycleHasCompletedException(
        existingFileLabel.id,
        existingFileLabel.status,
      );
    }
  }
}
