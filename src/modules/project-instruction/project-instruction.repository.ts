import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ProjectInstructionEntity } from './project-instruction.entity';

@Injectable()
export class ProjectInstructionRepository extends BaseRepository<ProjectInstructionEntity> {
  constructor(
    @InjectRepository(ProjectInstructionEntity)
    repository: Repository<ProjectInstructionEntity>,
  ) {
    super(repository, ProjectInstructionEntity);
  }

  async Create(
    projectInstruction: ProjectInstructionEntity,
    entityManager?: EntityManager,
  ): Promise<ProjectInstructionEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(projectInstruction);
  }

  async GetByProjectId(
    projectId: string,
    entityManager?: EntityManager
    ): Promise<ProjectInstructionEntity | null> {
    const repository = await this.GetRepository(entityManager);
    return repository.findOne({ where: { projectId: projectId } });
  }

  async Update(
    entity: ProjectInstructionEntity, 
    entityManager?: EntityManager,
  ): Promise<ProjectInstructionEntity> {
    const repository = await this.GetRepository(entityManager);
    return await repository.save(entity);
  }

  async Delete(
    id: string, 
    entityManager?: EntityManager,
  ): Promise<void> {
    const repository = await this.GetRepository(entityManager);
    await repository.delete(id);
  }
}
