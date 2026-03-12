import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ProjectConfigurationEntity } from './project-configuration.entity';
import { LabelEntity } from '../label/label.entity';
@Injectable()
export class ProjectConfigurationRepository extends BaseRepository<ProjectConfigurationEntity> {
  constructor(
    @InjectRepository(ProjectConfigurationEntity)
    repository: Repository<ProjectConfigurationEntity>,
  ) {
    super(repository, ProjectConfigurationEntity);
  }

  async Create(
    entity: ProjectConfigurationEntity,
  ): Promise<ProjectConfigurationEntity> {
    return this.repository.save(entity);
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    entityManager?: EntityManager,
  ): Promise<ProjectConfigurationEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository
      .createQueryBuilder('config')
      .where('config.id = :id', { id })
      .andWhere(includeDeleted ? '1=1' : 'config.deletedAt IS NULL')
      .getOne();

    if (!result) {
      return null;
    }

    // single join query for labels
    const labels = await repository.manager
      .createQueryBuilder(LabelEntity, 'label')
      .where('label.id = ANY(:ids::uuid[])', {
        ids: result?.availableLabelIds || [],
      })
      .getMany();
    result.availableLabels = labels;
    return result as ProjectConfigurationEntity | null;
  }

  async FindByProjectId(
    projectId: string,
    includeDeleted: boolean = false,
    entityManager?: EntityManager,
  ): Promise<ProjectConfigurationEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository
      .createQueryBuilder('config')
      .where('config.projectId = :projectId', { projectId })
      .andWhere('config.deletedAt IS NULL')
      .getOne();

    if (!result) {
      return null;
    }
    // single join query for labels
    const labels = await repository.manager
      .createQueryBuilder(LabelEntity, 'label')
      .where('label.id = ANY(:ids::uuid[])', {
        ids: result?.availableLabelIds || [],
      })
      .getMany();

    result.availableLabels = labels;
    return result as ProjectConfigurationEntity | null;
  }

  async Update(
    entity: ProjectConfigurationEntity,
    entityManager?: EntityManager,
  ): Promise<ProjectConfigurationEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(entity);
  }

  async SoftDeleteByProjectId(
    projectId: string,
    entityManager?: EntityManager,
  ): Promise<void> {
    const repository = await this.GetRepository(entityManager);
    await repository.update({ projectId }, { deletedAt: new Date() });
  }
}
