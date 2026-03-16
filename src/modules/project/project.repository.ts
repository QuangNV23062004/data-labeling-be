import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, IsNull } from 'typeorm';
import { ProjectEntity } from './project.entity';
import { FilterProjectQueryDto } from './dtos/filter-project-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { ProjectStatus } from './enums/project-status.enums';
import { ProjectStatisticsDto } from './dtos/project-statistics.dto';

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
    // console.log(id);
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
    } else {
      qb.andWhere('project.deletedAt IS NULL');
    }

    if (query?.createdById) {
      qb.andWhere('project.createdById = :createdById', {
        createdById: query.createdById,
      });
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

  async GetStatistics(
    createdById?: string,
    entityManager?: EntityManager,
  ): Promise<ProjectStatisticsDto> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('project');

    qb.select('COUNT(project.id)', 'totalCount')
      .addSelect(
        'SUM(CASE WHEN project.projectStatus = :activeStatus THEN 1 ELSE 0 END)',
        'activeCount',
      )
      .addSelect(
        'SUM(CASE WHEN project.projectStatus = :completedStatus THEN 1 ELSE 0 END)',
        'completedCount',
      )
      .addSelect(
        'SUM(CASE WHEN project.projectStatus = :archivedStatus THEN 1 ELSE 0 END)',
        'archivedCount',
      )
      .where('project.deletedAt IS NULL')
      .setParameters({
        activeStatus: ProjectStatus.ACTIVE,
        completedStatus: ProjectStatus.COMPLETED,
        archivedStatus: ProjectStatus.ARCHIVED,
      });

    if (createdById) {
      qb.andWhere('project.createdById = :createdById', { createdById });
    }

    const raw = await qb.getRawOne<{
      totalCount: string;
      activeCount: string;
      completedCount: string;
      archivedCount: string;
    }>();

    return {
      totalCount: Number(raw?.totalCount ?? 0),
      activeCount: Number(raw?.activeCount ?? 0),
      completedCount: Number(raw?.completedCount ?? 0),
      archivedCount: Number(raw?.archivedCount ?? 0),
    };
  }
}
