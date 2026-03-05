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
  ProjectCannotCompleteException,
  ProjectNotFoundException,
  UnsupportedProjectDataTypeException,
} from './exceptions/project-exceptions.exception';
import { StorageService } from 'src/common/storage/storage.service';
import { DataType } from './enums/data-type.enums';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { FileRepository } from '../file/file.repository';
import { FileLabelRepository } from '../file-label/file-label.repository';
import { FileLabelStatusEnums } from '../file-label/enums/file-label.enums';
import { ReviewErrorRepository } from '../review-error/review-error.repository';
import { AccountRatingRepository } from '../account-rating/account-rating.repository';
import { AccountRatingHistoryRepository } from '../account-rating-history/account-rating-history.repository';
import { AccountRatingEntity } from '../account-rating/account-rating.entity';
import { AccountRatingHistoryEntity } from '../account-rating-history/account-rating-history.entity';
import { ProjectDomain } from './project.domain';
import { AnnotatorBreakdownItem } from 'src/types/annotator-breakdown-items.types';

@Injectable()
export class ProjectService extends BaseService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly storageService: StorageService,
    private readonly fileLabelRepository: FileLabelRepository,
    private readonly projectConfigurationService: ProjectConfigurationService,
    private readonly reviewErrorRepository: ReviewErrorRepository,
    private readonly accountRatingRepository: AccountRatingRepository,
    private readonly accountRatingHistoryRepository: AccountRatingHistoryRepository,
    private readonly projectDomain: ProjectDomain,
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

  async CompleteProject(id: string, accountInfo?: AccountInfo) {
    const em = await this.projectRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const project = await this.projectRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      this.projectDomain.validateProjectExists(project, id);

      const fileLabels = await this.fileLabelRepository.FindAll(
        { projectId: id },
        false,
        transactionalEntityManager,
        false,
      );

      this.projectDomain.validateProjectFileLabelsCanBeCompleted(
        fileLabels,
        id,
      );

      project!.projectStatus = ProjectStatus.COMPLETED;
      const updatedProject = await this.projectRepository.Update(
        project!,
        transactionalEntityManager,
      );

      const metrics =
        await this.fileLabelRepository.FindProjectAnnotatorMetrics(
          id,
          transactionalEntityManager,
        );

      const breakdownRows =
        await this.fileLabelRepository.FindProjectAnnotatorErrorBreakdown(
          id,
          transactionalEntityManager,
        );

      const existing = await this.accountRatingRepository.FindByProjectId(
        id,
        false,
        transactionalEntityManager,
      );

      const existingByAccount = new Map(existing.map((x) => [x.accountId, x]));

      const breakdownByAnnotator: Map<string, AnnotatorBreakdownItem[]> =
        this.projectDomain.breakdownByAnnotator(breakdownRows);

      const ratingEntities: AccountRatingEntity[] =
        this.projectDomain.MapRatingEntitiesFromMetrics(
          metrics,
          existingByAccount,
          id,
        );

      const savedRatings = await this.accountRatingRepository.CreateBatch(
        ratingEntities,
        transactionalEntityManager,
      );
      const savedByAccount = new Map(savedRatings.map((x) => [x.accountId, x]));

      const historyEntities: AccountRatingHistoryEntity[] =
        this.projectDomain.MapRatingHistoryEntitiesFromMetrics(
          metrics,
          savedByAccount,
          existingByAccount,
          id,
          breakdownByAnnotator,
        );

      await this.accountRatingHistoryRepository.CreateBatch(
        historyEntities,
        transactionalEntityManager,
      );

      return {
        updatedProject,
        metrics,
        breakdown: breakdownByAnnotator,
        ratings: savedRatings,
        errors: breakdownRows,
        history: historyEntities,
      };
    });
  }
}
