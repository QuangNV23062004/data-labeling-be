import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, IsNull, Like } from 'typeorm';
import { ProjectEntity } from './project.entity';
import { FilterProjectQueryDto } from './dtos/filter-project-query.dto';

@Injectable()
export class ProjectRepository extends BaseRepository<ProjectEntity> {
  constructor(
    @InjectRepository(ProjectEntity)
    repository: Repository<ProjectEntity>,
  ) {
    super(repository, ProjectEntity);
  }

  async Create(
    project: ProjectEntity,
    entityManager?: EntityManager
  ): Promise<ProjectEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(project);
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    entityManager?: EntityManager
  ): Promise<ProjectEntity | null> {
    const repository = await this.GetRepository(entityManager);
    console.log(id);
    const whereCondition: any = { id: id };
    if (!includeDeleted) {
      whereCondition.deletedAt = IsNull();
    }
    return repository.findOne({ where: whereCondition });
  }

  async Update(
    project: ProjectEntity,
    entityManager?: EntityManager
  ): Promise<ProjectEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(project);
  }

  async SoftDelete(
    id: string,
    entityManager?: EntityManager
  ): Promise<void> {
    const repository = await this.GetRepository(entityManager);
    await repository.update(id, {deletedAt : new Date()});
  }

  async Restore(
    id: string,
    entityManager?: EntityManager
  ): Promise<void> {
    const repository = await this.GetRepository(entityManager);
    await repository.update(id, {deletedAt : null});
  }

  async FindPaginated(
    query : FilterProjectQueryDto,
    entityManager?: EntityManager
  ): Promise<ProjectEntity[]> {
    const repository = await this.GetRepository(entityManager);
    let page = query.page ? query.page : 1;
    let limit = query.limit ? query.limit : 10;
    
    const whereCondition: any = {};
    
    if (!query.includeDeleted) {
      whereCondition.deletedAt = IsNull();
    }
    
    if (query.name) {
      whereCondition.name = Like(`%${query.name}%`);
    }
    
    return repository.find({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        name: query.order === 'DESC' ? 'DESC' : 'ASC',
      },
    });
  }
}