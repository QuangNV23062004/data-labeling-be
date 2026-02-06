import { Injectable } from '@nestjs/common';
import { ProjectConfigurationRepository } from './project-configuration.repository';
import { BaseService } from 'src/common/service/base.service';
import { CreateProjectConfigurationDto } from './dtos/create-project-configuration.dto';
import { UpdateProjectConfigurationDto } from './dtos/update-project-configuration.dto';
import { ProjectConfigurationEntity } from './project-configuration.entity';
import { ProjectRepository } from '../project/project.repository';
import { LabelRepository } from '../label/label.repository';
import { InvalidProjectIdException, InvalidLabelIdsException, ProjectConfigurationNotFoundException } from './exceptions/project-configuration-exceptions.exception';

@Injectable()
export class ProjectConfigurationService extends BaseService {
  constructor(
    private readonly projectConfigurationRepository: ProjectConfigurationRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly labelRepository: LabelRepository,
  ) {
    super();
  }

  async Create(dto: CreateProjectConfigurationDto): Promise<ProjectConfigurationEntity> {
    // Check if all labels exist
    if (dto.availableLabelIds && dto.availableLabelIds.length > 0) {
      const labels = await this.labelRepository.FindByIds(dto.availableLabelIds, false);
      if (labels.length !== dto.availableLabelIds.length) {
        const foundLabelIds = labels.map(label => label.id);
        const missingLabelIds = dto.availableLabelIds.filter(id => !foundLabelIds.includes(id));
        throw new InvalidLabelIdsException(missingLabelIds);
      }
    }

    // Create project configuration
    const projectConfiguration = new ProjectConfigurationEntity();
    projectConfiguration.projectId = dto.projectId;
    projectConfiguration.availableLabelIds = dto.availableLabelIds;
    return this.projectConfigurationRepository.Create(projectConfiguration);
  }

  async GetByProjectId(projectId: string): Promise<ProjectConfigurationEntity> {
    const projectConfiguration = await this.projectConfigurationRepository.FindByProjectId(projectId, false);
    if (!projectConfiguration) {
      throw new ProjectConfigurationNotFoundException(projectId);
    }
    return projectConfiguration;
  }

  async Update(
    projectId: string,
    dto: UpdateProjectConfigurationDto,
  ): Promise<ProjectConfigurationEntity> {
    const em = await this.projectConfigurationRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      // Check if project configuration exists
      const projectConfiguration = await this.projectConfigurationRepository.FindByProjectId(
        projectId,
        false,
        transactionalEntityManager,
      );
      if (!projectConfiguration) {
        throw new ProjectConfigurationNotFoundException(projectId);
      }

      // Check if all labels exist
      const labels = await this.labelRepository.FindByIds(
        dto.availableLabelIds,
        false,
        transactionalEntityManager,
      );
      if (labels.length !== dto.availableLabelIds.length) {
        const foundLabelIds = labels.map(label => label.id);
        const missingLabelIds = dto.availableLabelIds.filter(
          id => !foundLabelIds.includes(id),
        );
        throw new InvalidLabelIdsException(missingLabelIds);
      }

      // Update the entity
      projectConfiguration.availableLabelIds = dto.availableLabelIds;
      return this.projectConfigurationRepository.Update(
        projectConfiguration,
        transactionalEntityManager,
      );
    });
  }

  async SoftDeleteByProjectId(
    projectId: string,
    entityManager?: any,
  ): Promise<void> {
    await this.projectConfigurationRepository.SoftDeleteByProjectId(
      projectId,
      entityManager,
    );
  }

}
