import { HttpException, Injectable } from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { CreateProjectDto } from './dtos/create-project.dto';
import { ProjectEntity } from './project.entity';
import { ProjectStatus } from './enums/project-status.enums';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { FilterProjectQueryDto } from './dtos/filter-project-query.dto';
import { BaseService } from 'src/common/service/base.service';
import { AccountInfo } from 'src/interfaces/request';
import {
  ProjectNotFoundException,
  UnsupportedProjectDataTypeException,
} from './exceptions/project-exceptions.exception';
import { StorageService } from 'src/common/storage/storage.service';
import { DataType } from './enums/data-type.enums';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';

@Injectable()
export class ProjectService extends BaseService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly storageService: StorageService,
  ) {
    super();
  }

  async Create(
    request: CreateProjectDto,
    userId: string,
    image?: Express.Multer.File,
  ): Promise<ProjectEntity> {
    const em = await this.projectRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      if (request.dataType !== DataType.IMAGE) {
        throw new UnsupportedProjectDataTypeException(request.dataType);
      }

      const projectEntity: Partial<ProjectEntity> = {
        name: request.name,
        description: request.description,
        dataType: request.dataType,
        createdById: userId,

        projectStatus: ProjectStatus.ACTIVE,
      };
      let createdProject = await this.projectRepository.Create(
        projectEntity as ProjectEntity,
        transactionalEntityManager,
      );

      if (image) {
        const imageUrl = await this.storageService.uploadFilePath(
          `projects/${createdProject.id}/thumbnail`,
          image,
        );
        createdProject.imageUrl = imageUrl;
        createdProject = await this.projectRepository.Update(
          createdProject,
          transactionalEntityManager,
        );
      }

      return createdProject;
    });
  }

  async Update(
    project: UpdateProjectDto,
    image?: Express.Multer.File,
  ): Promise<ProjectEntity> {
    const em = await this.projectRepository.GetEntityManager();
    let oldImageUrl: string | undefined;
    const transactionResult = await em.transaction(
      async (transactionalEntityManager) => {
        let entity = await this.projectRepository.FindById(
          project.id,
          false,
          transactionalEntityManager,
        );

        if (!entity) throw new ProjectNotFoundException(project.id);

        entity.name = project.name ?? entity.name;
        entity.description = project.description ?? entity.description;
        if (project.dataType && project.dataType !== DataType.IMAGE) {
          throw new UnsupportedProjectDataTypeException(project.dataType);
        }

        entity.dataType = project.dataType ?? entity.dataType;

        if (image) {
          const imageUrl = await this.storageService.uploadFilePath(
            `projects/${entity.id}/thumbnail`,
            image,
          );
          oldImageUrl = entity.imageUrl;
          entity.imageUrl = imageUrl;
        }

        return await this.projectRepository.Update(
          entity,
          transactionalEntityManager,
        );
      },
    );

    if (oldImageUrl) {
      await this.storageService.deleteBlob([oldImageUrl]);
    }

    return transactionResult;
  }

  async Delete(projectId: string): Promise<void> {
    const em = await this.projectRepository.GetEntityManager();
    await em.transaction(async (transactionalEntityManager) => {
      await this.projectRepository.SoftDelete(
        projectId,
        transactionalEntityManager,
      );
    });
  }

  async GetById(
    projectId: string,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ): Promise<ProjectEntity | null> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    let entity = await this.projectRepository.FindById(
      projectId,
      safeIncludedDeleted,
    );
    if (!entity) {
      throw new ProjectNotFoundException(projectId);
    }

    return entity;
  }

  async GetPaginated(
    query: FilterProjectQueryDto,
    accountInfo?: AccountInfo,
  ): Promise<PaginationResultDto<ProjectEntity>> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      query.includeDeleted,
    );
    query.includeDeleted = safeIncludedDeleted;
    return await this.projectRepository.FindPaginated(query);
  }
}
