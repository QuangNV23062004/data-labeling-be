import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ProjectConfigurationEntity } from './project-configuration.entity';
@Injectable()
export class ProjectConfigurationRepository extends BaseRepository<ProjectConfigurationEntity> {
  constructor(
    @InjectRepository(ProjectConfigurationEntity)
    repository: Repository<ProjectConfigurationEntity>,
  ) {
    super(repository, ProjectConfigurationEntity);
  }

  async Create(entity: ProjectConfigurationEntity): Promise<ProjectConfigurationEntity> {
    return this.repository.save(entity);
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    entityManager?: EntityManager,
  ): Promise<ProjectConfigurationEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const whereCondition: any = { id };
    if (!includeDeleted) {
      whereCondition.deletedAt = null;
    }
    return repository.findOne({ where: whereCondition });
  }

  async FindByProjectId(
    projectId: string,
    includeDeleted: boolean = false,
    entityManager?: EntityManager,
  ): Promise<ProjectConfigurationEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const whereCondition: any = { projectId };
    if (!includeDeleted) {
      whereCondition.deletedAt = null;
    }
    return repository.findOne({ where: whereCondition });
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
