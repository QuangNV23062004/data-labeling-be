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
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';

@Injectable()
export class ProjectService extends BaseService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly storageService: StorageService,
    private readonly projectConfigurationService: ProjectConfigurationService,
  ) {
    super();
  }

  async Create(
    request: CreateProjectDto,
    userId: string,
    image?: Express.Multer.File,
  ): Promise<ProjectEntity> {
    const em = await this.projectRepository.GetEntityManager();
    let entity = await em.transaction(async (transactionalEntityManager) => {
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

    // Auto-create project configuration
    await this.projectConfigurationService.Create({
      projectId: entity.id,
      availableLabelIds: request.availableLabelIds ?? [],
    });
    
    return entity;
  }

  async Update(
    id: string,
    dto: UpdateProjectDto,
    image?: Express.Multer.File,
  ): Promise<ProjectEntity> {
    const em = await this.projectRepository.GetEntityManager();
    let oldImageUrl: string | undefined;
    const transactionResult = await em.transaction(
      async (transactionalEntityManager) => {
        let entity = await this.projectRepository.FindById(
          id,
          false,
          transactionalEntityManager,
        );

        if (!entity) throw new ProjectNotFoundException(id);

        entity.name = dto.name ?? entity.name;
        entity.description = dto.description ?? entity.description;
        if (dto.dataType && dto.dataType !== DataType.IMAGE) {
          throw new UnsupportedProjectDataTypeException(dto.dataType);
        }

        entity.dataType = dto.dataType ?? entity.dataType;

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
      // Soft delete the project
      await this.projectRepository.SoftDelete(
        projectId,
        transactionalEntityManager,
      );
      
      // Cascade soft delete to project configuration
      await this.projectConfigurationService.SoftDeleteByProjectId(
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
