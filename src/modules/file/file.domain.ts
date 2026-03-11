import { Injectable } from '@nestjs/common';
import { FileEntity } from './file.entity';
import {
  CannotRestoreAFileInsideADeletedProjectException,
  CanOnlyUploadFilesToDraftProjectsException,
  ProjectTypeFileTypeMismatchException,
  StaffAssignedToFileInvalidRoleException,
  StaffAssignedToFileNotFoundException,
  StaffAssignedToFileWithoutProjectTaskException,
  UnknownFileFormatException,
} from './exceptions/file-exceptions.exception';
import { DataType } from '../project/enums/data-type.enums';
import { ImageExtension } from './enums/image-extensions.enums';
import { VideoExtension } from './enums/video-extensions.enums';
import { TextExtension } from './enums/text-extensions.enums';
import { AudioExtension } from './enums/audio-extensions.enums';
import { ProjectEntity } from '../project/project.entity';
import { ProjectNotFoundException } from '../project/exceptions/project-exceptions.exception';
import { CreateFileDto } from './dtos/create-file.dto';
import { ProjectStatus } from '../project/enums/project-status.enums';
import { AccountEntity } from '../account/account.entity';
import { Role } from '../account/enums/role.enum';

@Injectable()
export class FileDomain {
  validateAnnotator(
    annotator: AccountEntity | null,
    annotatorId: string,
    fileId?: string,
  ) {
    if (!annotator) {
      throw new StaffAssignedToFileNotFoundException(
        annotatorId,
        Role.ANNOTATOR,
      );
    }

    if (annotator.role !== Role.ANNOTATOR) {
      throw new StaffAssignedToFileInvalidRoleException(
        annotatorId,
        Role.ANNOTATOR,
        annotator.role,
        Role.ANNOTATOR,
        fileId ?? undefined,
      );
    }
  }

  validateReviewer(
    reviewer: AccountEntity | null,
    reviewerId: string,
    fileId?: string,
  ) {
    if (!reviewer) {
      throw new StaffAssignedToFileNotFoundException(reviewerId, Role.REVIEWER);
    }
    if (reviewer.role !== Role.REVIEWER) {
      throw new StaffAssignedToFileInvalidRoleException(
        reviewerId,
        Role.REVIEWER,
        reviewer.role,
        Role.REVIEWER,
        fileId ?? undefined,
      );
    }
  }
  validateProjectToCreateFile(
    project: ProjectEntity | null,
    data: CreateFileDto,
  ) {
    if (!project) {
      throw new ProjectNotFoundException(data.projectId);
    }

    // if (project.projectStatus !== ProjectStatus.DRAFT) {
    //   throw new CanOnlyUploadFilesToDraftProjectsException(data.projectId);
    // }
  }

  checkFileAndProjectType(file: Express.Multer.File, projectType: DataType) {
    let allowExtensions;
    switch (projectType) {
      case DataType.IMAGE:
        allowExtensions = Object.values(ImageExtension);
        break;

      case DataType.VIDEO:
        allowExtensions = Object.values(VideoExtension);
        break;

      case DataType.TEXT:
        allowExtensions = Object.values(TextExtension);
        break;

      case DataType.AUDIO:
        allowExtensions = Object.values(AudioExtension);
        break;
      default:
        allowExtensions = [];
        break;
    }
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (!extension) {
      throw new UnknownFileFormatException(file.originalname);
    }

    if (!allowExtensions.includes(extension)) {
      throw new ProjectTypeFileTypeMismatchException(
        projectType,
        extension as string,
      );
    }
    return true;
  }

  validateFilesFromDeletedProject(entity: FileEntity) {
    if (entity?.project?.deletedAt != null) {
      throw new CannotRestoreAFileInsideADeletedProjectException(
        entity?.id,
        entity?.projectId,
      );
    }
  }

  validateStaffHasTaskInProjectForFileAssignment(
    hasTask: boolean,
    staffId: string,
    role: Role.ANNOTATOR | Role.REVIEWER,
    projectId: string,
    fileId: string,
  ) {
    if (hasTask) {
      return;
    }

    throw new StaffAssignedToFileWithoutProjectTaskException(
      staffId,
      role === Role.ANNOTATOR ? 'annotator' : 'reviewer',
      projectId,
      fileId,
    );
  }
}
