import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from 'src/common/service/base.service';
import { FileRepository } from './file.repository';
import { AccountInfo } from 'src/interfaces/request';
import { FilterFileQueryDto } from './dtos/filter-file-query.dto';
import { FileEntity } from './file.entity';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { CreateFileDto } from './dtos/create-file.dto';
import { StorageService } from 'src/common/storage/storage.service';
import {
  CannotHardDeleteAFileWithExistingFileLabelsException,
  CannotRestoreAFileInsideADeletedProjectException,
  CanOnlyUploadFilesToDraftProjectsException,
  FileNotFoundException,
  FileTypeNotSupportedException,
  ProjectTypeFileTypeMismatchException,
  UnknownFileFormatException,
} from './exceptions/file-exceptions.exception';
import { ContentType } from './enums/content-type.enums';
import { UpdateFileDto } from './dtos/update-file.dto';
import { ProjectRepository } from '../project/project.repository';
import { ProjectNotFoundException } from '../project/exceptions/project-exceptions.exception';
import { ProjectStatus } from '../project/enums/project-status.enums';
import { DataType } from '../project/enums/data-type.enums';

@Injectable()
export class FileService extends BaseService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly repository: FileRepository,
    private readonly storageService: StorageService,
    private readonly projectRepository: ProjectRepository,
  ) {
    super();
  }

  private checkFileAndProjectType(
    file: Express.Multer.File,
    projectType: DataType,
  ) {
    let allowExtensions;
    switch (projectType) {
      case DataType.IMAGE:
        allowExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'];
        break;

      case DataType.VIDEO:
        allowExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv'];
        break;

      case DataType.TEXT:
        allowExtensions = ['txt', 'docs', 'docx', 'pdf'];
        break;

      case DataType.AUDIO:
        allowExtensions = ['mp3', 'wav', 'aac'];
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
      const extension = file.mimetype.split('/')[1];
      const filePath = await this.storageService.uploadFilePath(
        `${data.projectId}/files`,
        file,
      );

      const project = await this.projectRepository.FindById(
        data.projectId,
        false,
        transactionalEntityManager,
      );

      if (!project) {
        throw new ProjectNotFoundException(data.projectId);
      }

      if (project.projectStatus !== ProjectStatus.DRAFT) {
        throw new CanOnlyUploadFilesToDraftProjectsException(data.projectId);
      }

      this.checkFileAndProjectType(file, project.dataType);

      const contentType =
        ContentType[extension.toUpperCase() as keyof typeof ContentType];
      if (!contentType) {
        throw new UnknownFileFormatException(file.originalname);
      }
      entity.contentType = contentType;
      entity.fileName = file.originalname;
      entity.fileSize = file.size;
      entity.fileUrl = filePath;
      entity.projectId = data.projectId;
      entity.uploadedById = accountInfo?.sub as string;
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

          entity.fileName = file.originalname;
          entity.fileSize = file.size;
          entity.fileUrl = filePath;
          entity.uploadedById = accountInfo?.sub as string;
        }

        if (data?.projectId || file) {
          // Check compatibility: Use the new file if provided, otherwise use the existing file's extension
          const fileToCheck =
            file || ({ originalname: entity.fileName } as Express.Multer.File); // Mock file object for existing file
          this.checkFileAndProjectType(fileToCheck, entity.project?.dataType);
        }
        Object.assign(entity, data);

        const result = await this.repository.Update(
          entity,
          transactionalEntityManager,
        );
        return result;
      },
    );

    //only delete old file when transaction success
    if (oldFile) {
      await this.storageService.deleteBlob([oldFile]);
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

        // Delete blob from Azure storage
        try {
          this.logger.log(
            `Attempting to delete blob for file ${id}: ${entity.fileUrl}`,
          );
          await this.storageService.deleteBlob([entity.fileUrl]);
          this.logger.log(`Successfully deleted blob for file ${id}`);
        } catch (error) {
          this.logger.error(
            `Failed to delete blob for file ${id}: ${error.message}`,
            error.stack,
          );
          throw error;
        }
        oldFile = entity.fileUrl;

        return this.repository.HardDelete(id, transactionalEntityManager);
      },
    );

    if (oldFile) {
      await this.storageService.deleteBlob([oldFile]);
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

      if (entity?.project?.deletedAt != null) {
        throw new CannotRestoreAFileInsideADeletedProjectException(
          id,
          entity.projectId,
        );
      }

      return this.repository.Restore(id, transactionalEntityManager);
    });
  }
}
