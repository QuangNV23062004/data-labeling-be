import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, IsNull, Like } from 'typeorm';
import { ProjectEntity } from './project.entity';
import { FilterProjectQueryDto } from './dtos/filter-project-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';

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
    entityManager?: EntityManager,
  ): Promise<ProjectEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(project);
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    entityManager?: EntityManager,
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
    entityManager?: EntityManager,
  ): Promise<ProjectEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(project);
  }

  async SoftDelete(id: string, entityManager?: EntityManager): Promise<void> {
    const repository = await this.GetRepository(entityManager);
    await repository.update(id, { deletedAt: new Date() });
  }

  async Restore(id: string, entityManager?: EntityManager): Promise<void> {
    const repository = await this.GetRepository(entityManager);
    await repository.update(id, { deletedAt: null });
  }

  async FindPaginated(
    query: FilterProjectQueryDto,
    entityManager?: EntityManager,
  ): Promise<PaginationResultDto<ProjectEntity>> {
    const repository = await this.GetRepository(entityManager);

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const qb = repository.createQueryBuilder('project');

    if (query?.includeDeleted) {
      qb.andWhere('project.deletedAt IS NOT NULL');
    }

    //old filter
    if (query?.name) {
      qb.andWhere('project.name ILIKE :name', { name: `%${query.name}%` });
    }

    if (query?.search) {
      const searchBy = query.searchBy ? query.searchBy : 'name';
      qb.andWhere(`project.${searchBy} ILIKE unaccent(:search)`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.order) {
      const orderDirection: 'ASC' | 'DESC' = (query?.order || 'ASC') as
        | 'ASC'
        | 'DESC';
      qb.orderBy(`project.${query.orderBy}`, orderDirection);
    }

    const totalItems = await qb.getCount();

    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<ProjectEntity>(
      items,
      Math.ceil(totalItems / limit),
      page,
      limit,
      query?.search || '',
      query?.searchBy || '',
      query?.order || '',
      query?.orderBy || '',
      page < Math.ceil(totalItems / limit),
      page > 1,
    );
  }
}
