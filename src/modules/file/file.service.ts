import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from 'src/common/service/base.service';
import { FileRepository } from './file.repository';
import { AccountInfo } from 'src/interfaces/request';
import { FilterFileQueryDto } from './dtos/filter-file-query.dto';
import { FileEntity } from './file.entity';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { CreateFileDto } from './dtos/create-file.dto';
import { StorageService } from 'src/common/storage/storage.service';
import { EntityManager } from 'typeorm';
import {
  CannotHardDeleteAFileWithExistingFileLabelsException,
  CannotRestoreAFileInsideADeletedProjectException,
  CanOnlyUploadFilesToDraftProjectsException,
  FileNotFoundException,
  FileTypeNotSupportedException,
  OnlyStatusUpdateAllowedForRoleException,
  ProjectTypeFileTypeMismatchException,
  StaffAssignedToFileInvalidRoleException,
  StaffAssignedToFileNotFoundException,
  UnknownFileFormatException,
} from './exceptions/file-exceptions.exception';
import { ContentType } from './enums/content-type.enums';
import { FileStatus } from './enums/file-status.enums';
import { UpdateFileDto } from './dtos/update-file.dto';
import { ProjectRepository } from '../project/project.repository';
import { ProjectNotFoundException } from '../project/exceptions/project-exceptions.exception';
import { AccountRepository } from '../account/account.repository';
import { AccountNotFoundException } from '../account/exceptions/account-exceptions.exceptions';
import { ProjectStatus } from '../project/enums/project-status.enums';
import { DataType } from '../project/enums/data-type.enums';
import { ImageExtension } from './enums/image-extensions.enums';
import { TextExtension } from './enums/text-extensions.enums';
import { VideoExtension } from './enums/video-extensions.enums';
import { AudioExtension } from './enums/audio-extensions.enums';
import { FileDomain } from './file.domain';
import { Role } from '../account/enums/role.enum';
import { FileLabelRepository } from '../file-label/file-label.repository';
import { FileLabelStatusEnums } from '../file-label/enums/file-label.enums';
import { ProjectTaskEntity } from '../project-task/project-task.entity';

@Injectable()
export class FileService extends BaseService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly repository: FileRepository,
    private readonly accountRepository: AccountRepository,
    private readonly storageService: StorageService,
    private readonly projectRepository: ProjectRepository,
    private readonly fileLabelRepository: FileLabelRepository,
    private readonly fileDomain: FileDomain,
  ) {
    super();
  }

  async FindAll(
    query: FilterFileQueryDto,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ): Promise<FileEntity[]> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.repository.FindAll(query, safeIncludedDeleted);
  }

  async FindPaginated(
    query: FilterFileQueryDto,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ): Promise<PaginationResultDto<FileEntity>> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.repository.FindPaginated(query, safeIncludedDeleted);
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ): Promise<FileEntity | null> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.repository.FindById(id, safeIncludedDeleted);
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ): Promise<FileEntity[]> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.repository.FindByIds(ids, safeIncludedDeleted);
  }

  async Create(
    file: Express.Multer.File,
    data: CreateFileDto,
    accountInfo?: AccountInfo,
  ): Promise<FileEntity> {
    const em = await this.repository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const entity = new FileEntity();
      const filePath = await this.storageService.uploadFilePath(
        `${data.projectId}/files`,
        file,
      );

      const project = await this.projectRepository.FindById(
        data.projectId,
        false,
        transactionalEntityManager,
      );

      this.fileDomain.validateProjectToCreateFile(project, data);

      this.fileDomain.checkFileAndProjectType(
        file,
        project?.dataType as DataType,
      );

      entity.contentType = this.resolveContentType(file);
      entity.fileName = file.originalname;
      entity.fileSize = file.size;
      entity.fileUrl = filePath;
      entity.projectId = data.projectId;
      entity.uploadedById = accountInfo?.sub as string;
      entity.status = data.status ?? FileStatus.IN_ANNOTATION;

      if (data.annotatorId !== undefined) {
        const annotator = await this.accountRepository.FindById(
          data.annotatorId,
          false,
          transactionalEntityManager,
        );

        this.fileDomain.validateAnnotator(
          annotator,
          data.annotatorId,
          undefined,
        );

        entity.annotatorId = data.annotatorId;
        entity.annotator = annotator;
      }

      if (data.reviewerId !== undefined) {
        const reviewer = await this.accountRepository.FindById(
          data.reviewerId,
          false,
          transactionalEntityManager,
        );
        this.fileDomain.validateReviewer(reviewer, data.reviewerId, undefined);

        entity.reviewerId = data.reviewerId;
        entity.reviewer = reviewer;
      }

      return this.repository.Create(entity, transactionalEntityManager);
    });
  }

  //Not sure what to update. All data source of truth is from the uploaded file, may be update file.
  async Update(
    id: string,
    data: UpdateFileDto,
    file?: Express.Multer.File,
    accountInfo?: AccountInfo,
  ): Promise<FileEntity> {
    const restrictedRoles: string[] = [Role.ANNOTATOR, Role.REVIEWER];
    const callerRole = accountInfo?.role;

    if (callerRole && restrictedRoles.includes(callerRole)) {
      if (data.status === undefined) {
        throw new OnlyStatusUpdateAllowedForRoleException(callerRole);
      }
      // Strip everything except status — these roles may NOT touch metadata,
      // assignments, or the physical file.
      data = { status: data.status };
      file = undefined;
    }
    const em = await this.repository.GetEntityManager();
    let oldFile;
    const transactionResult = await em.transaction(
      async (transactionalEntityManager) => {
        const entity = await this.repository.FindById(
          id,
          false,
          transactionalEntityManager,
        );

        if (!entity) {
          throw new FileNotFoundException(id);
        }

        const previousProjectId = entity.projectId;
        const previousAnnotatorId = entity.annotatorId;
        const previousReviewerId = entity.reviewerId;

        if (data?.projectId) {
          const project = await this.projectRepository.FindById(
            data.projectId,
            false,
            transactionalEntityManager,
          );
          if (!project) {
            throw new ProjectNotFoundException(data.projectId);
          }

          entity.projectId = data.projectId;
          entity.project = project;
        }

        if (file) {
          oldFile = entity.fileUrl;

          const filePath = await this.storageService.uploadFilePath(
            `${entity.projectId}/files`,
            file,
          );

          entity.contentType = this.resolveContentType(file);
          entity.fileName = file.originalname;
          entity.fileSize = file.size;
          entity.fileUrl = filePath;
          entity.uploadedById = accountInfo?.sub as string;
        }

        if (data?.projectId || file) {
          // Check compatibility: Use the new file if provided, otherwise use the existing file's extension
          const fileToCheck =
            file || ({ originalname: entity.fileName } as Express.Multer.File); // Mock file object for existing file
          this.fileDomain.checkFileAndProjectType(
            fileToCheck,
            entity.project?.dataType,
          );
        }

        // console.log(data);

        // console.log(
        //   'block object condition: ',
        //   data?.annotatorId !== undefined,
        //   data.annotatorId,
        //   entity?.annotatorId,
        //   data.annotatorId !== entity?.annotatorId,
        // );
        if (
          data?.annotatorId !== undefined &&
          data.annotatorId !== entity?.annotatorId
        ) {
          // console.log('Updating annotator...');

          const annotator = await this.accountRepository.FindById(
            data.annotatorId,
            false,
            transactionalEntityManager,
          );

          this.fileDomain.validateAnnotator(annotator, data.annotatorId, id);

          // If the file already has an annotator, mark this file's old annotator labels as reassigned.
          const existingAnnotatorFileLabels = entity.annotatorId
            ? await this.fileLabelRepository.FindAll(
                { fileId: id, annotatorId: entity.annotatorId },
                false,
                transactionalEntityManager,
              )
            : [];

          //only update ones with status not approved => aka not reviewed  & approved yet
          const ids = existingAnnotatorFileLabels
            .filter(
              (fileLabel) => fileLabel.status !== FileLabelStatusEnums.APPROVED,
            )
            .map((fileLabel) => fileLabel.id);

          // console.log('ids:', ids);
          if (ids.length > 0) {
            await this.fileLabelRepository.BatchUpdateStatus(
              ids,
              FileLabelStatusEnums.REASSIGNED,
              transactionalEntityManager,
            );
          }

          entity.annotatorId = data.annotatorId;
          entity.annotator = annotator;
        }

        if (
          data?.reviewerId !== undefined &&
          data.reviewerId !== entity?.reviewerId
        ) {
          const reviewer = await this.accountRepository.FindById(
            data.reviewerId,
            false,
            transactionalEntityManager,
          );

          this.fileDomain.validateReviewer(reviewer, data.reviewerId, id);

          entity.reviewerId = data.reviewerId;

          // Keep active file-label ownership in sync with the file reviewer assignment.
          await this.fileLabelRepository.BatchUpdateReviewerByFileId(
            id,
            data.reviewerId,
            transactionalEntityManager,
          );
        }

        const isProjectChanged = previousProjectId !== entity.projectId;
        const nextAnnotatorId =
          data?.annotatorId !== undefined
            ? data.annotatorId
            : previousAnnotatorId;
        const nextReviewerId =
          data?.reviewerId !== undefined ? data.reviewerId : previousReviewerId;

        if (
          nextAnnotatorId &&
          (isProjectChanged || nextAnnotatorId !== previousAnnotatorId)
        ) {
          await this.syncFileIdAcrossTasksForRole(
            transactionalEntityManager,
            id,
            Role.ANNOTATOR,
            previousProjectId,
            entity.projectId,
            previousAnnotatorId,
            nextAnnotatorId,
          );
        }

        if (
          nextReviewerId &&
          (isProjectChanged || nextReviewerId !== previousReviewerId)
        ) {
          await this.syncFileIdAcrossTasksForRole(
            transactionalEntityManager,
            id,
            Role.REVIEWER,
            previousProjectId,
            entity.projectId,
            previousReviewerId,
            nextReviewerId,
          );
        }

        Object.assign(entity, data);
        // Persist scalar fields only; loaded relations can cause noisy/fragile save behavior.
        delete (entity as Partial<FileEntity>).project;
        delete (entity as Partial<FileEntity>).uploadedBy;
        delete (entity as Partial<FileEntity>).annotator;
        delete (entity as Partial<FileEntity>).reviewer;
        delete (entity as Partial<FileEntity>).fileLabels;

        const result = await this.repository.Update(
          entity,
          transactionalEntityManager,
        );
        return result;
      },
    );

    //only delete old file when transaction success
    if (oldFile) {
      try {
        await this.storageService.deleteBlob([oldFile]);
      } catch (error) {
        this.logger.error(
          `Failed to delete blob for file ID "${id}" at "${oldFile}": ${error.message}`,
        );
      }
    }
    return transactionResult;
  }

  async SoftDelete(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    const em = await this.repository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const entity = await this.repository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      if (!entity) {
        throw new FileNotFoundException(id);
      }

      await this.syncFileIdAcrossTasksForRole(
        transactionalEntityManager,
        id,
        Role.ANNOTATOR,
        entity.projectId,
        entity.projectId,
        entity.annotatorId,
        null,
      );

      await this.syncFileIdAcrossTasksForRole(
        transactionalEntityManager,
        id,
        Role.REVIEWER,
        entity.projectId,
        entity.projectId,
        entity.reviewerId,
        null,
      );

      entity.annotatorId = null;
      entity.reviewerId = null;
      await this.repository.Update(entity, transactionalEntityManager);

      return this.repository.SoftDelete(id, transactionalEntityManager);
    });
  }

  async HardDelete(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    this.validateAdminForHardDelete(accountInfo);

    const em = await this.repository.GetEntityManager();
    let oldFile;
    const transactionResult = await em.transaction(
      async (transactionalEntityManager) => {
        const entity = await this.repository.FindById(
          id,
          true,
          transactionalEntityManager,
        );

        if (!entity) {
          throw new FileNotFoundException(id);
        }

        if (entity?.fileLabels?.length > 0) {
          throw new CannotHardDeleteAFileWithExistingFileLabelsException(id);
        }

        oldFile = entity.fileUrl;

        return this.repository.HardDelete(id, transactionalEntityManager);
      },
    );

    try {
      if (oldFile) {
        await this.storageService.deleteBlob([oldFile]);
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete blob for file ID "${id}" at "${oldFile}": ${error.message}`,
      );
    }
    return transactionResult;
  }

  async Restore(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    const em = await this.repository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const entity = await this.repository.FindById(
        id,
        true,
        transactionalEntityManager,
      );

      if (!entity) {
        throw new FileNotFoundException(id);
      }

      this.fileDomain.validateFilesFromDeletedProject(entity);

      return this.repository.Restore(id, transactionalEntityManager);
    });
  }

  async GetUnassignedFiles(
    projectId: string,
    role: Role,
    includeDeleted: boolean,
    accountInfo?: AccountInfo,
  ) {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.repository.GetUnassignedFiles(
      projectId,
      role,
      safeIncludedDeleted,
    );
  }

  private resolveContentType(file: Express.Multer.File): ContentType {
    const mimeType = file.mimetype.toLowerCase();
    const contentType = Object.values(ContentType).find(
      (type) => type === mimeType,
    );

    if (!contentType) {
      throw new UnknownFileFormatException(file.originalname);
    }

    return contentType;
  }

  private async findLatestTaskForAssigneeAndRole(
    em: EntityManager,
    projectId: string,
    assigneeId: string,
    role: Role.ANNOTATOR | Role.REVIEWER,
  ): Promise<ProjectTaskEntity | null> {
    const repository = em.getRepository(ProjectTaskEntity);

    return repository
      .createQueryBuilder('task')
      .where('task.projectId = :projectId', { projectId })
      .andWhere('task.assignedTo = :assigneeId', { assigneeId })
      .andWhere('task.assignedUserRole = :role', { role })
      .andWhere('task.deletedAt IS NULL')
      .orderBy('task.updatedAt', 'DESC')
      .addOrderBy('task.createdAt', 'DESC')
      .getOne();
  }

  private async syncFileIdAcrossTasksForRole(
    em: EntityManager,
    fileId: string,
    role: Role.ANNOTATOR | Role.REVIEWER,
    previousProjectId: string,
    nextProjectId: string,
    previousAssigneeId: string | null,
    nextAssigneeId: string | null,
  ): Promise<void> {
    const taskRepository = em.getRepository(ProjectTaskEntity);

    const nextTask = nextAssigneeId
      ? await this.findLatestTaskForAssigneeAndRole(
          em,
          nextProjectId,
          nextAssigneeId,
          role,
        )
      : null;

    if (nextAssigneeId) {
      this.fileDomain.validateStaffHasTaskInProjectForFileAssignment(
        Boolean(nextTask),
        nextAssigneeId,
        role,
        nextProjectId,
        fileId,
      );
    }

    if (previousAssigneeId) {
      const previousTask = await this.findLatestTaskForAssigneeAndRole(
        em,
        previousProjectId,
        previousAssigneeId,
        role,
      );

      const previousTaskFileIds = previousTask?.fileIds ?? [];

      if (
        previousTask &&
        (!nextTask || previousTask.id !== nextTask.id) &&
        previousTaskFileIds.includes(fileId)
      ) {
        previousTask.fileIds = previousTaskFileIds.filter(
          (existingId) => existingId !== fileId,
        );
        await taskRepository.save(previousTask);
      }
    }

    const nextTaskFileIds = nextTask?.fileIds ?? [];

    if (nextTask && !nextTaskFileIds.includes(fileId)) {
      nextTask.fileIds = [...nextTaskFileIds, fileId];
      await taskRepository.save(nextTask);
    }
  }
}
