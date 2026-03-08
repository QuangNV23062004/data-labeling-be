import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { ProjectSnapshotEntity } from './project-snapshot.entity';
import { FilterProjectSnapshotQueryDto } from './dtos/filter-project-snapshot-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';

@Injectable()
export class ProjectSnapshotRepository extends BaseRepository<ProjectSnapshotEntity> {
  constructor(
    @InjectRepository(ProjectSnapshotEntity)
    repository: Repository<ProjectSnapshotEntity>,
  ) {
    super(repository, ProjectSnapshotEntity);
  }

  async Create(
    entity: ProjectSnapshotEntity,
    entityManager?: EntityManager,
  ): Promise<ProjectSnapshotEntity> {
    const repo = await this.GetRepository(entityManager);
    return repo.save(entity);
  }

  async FindPaginated(
    projectId: string,
    query: FilterProjectSnapshotQueryDto,
    entityManager?: EntityManager,
  ): Promise<PaginationResultDto<Omit<ProjectSnapshotEntity, 'snapshotData'>>> {
    const repo = await this.GetRepository(entityManager);
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const offset = (page - 1) * limit;

    const qb = repo
      .createQueryBuilder('s')
      .select([
        's.id',
        's.projectId',
        's.version',
        's.name',
        's.description',
        's.totalFiles',
        's.createdById',
        's.createdAt',
        's.updatedAt',
      ])
      .where('s.projectId = :projectId', { projectId })
      .andWhere('s.deletedAt IS NULL');

    if (query?.search) {
      qb.andWhere('s.name ILIKE :search', { search: `%${query.search}%` });
    }

    qb.orderBy('s.createdAt', 'DESC');

    const totalItems = await qb.getCount();
    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto(
      items,
      Math.ceil(totalItems / limit),
      page,
      limit,
      query?.search ?? '',
      '',
      'DESC',
      'createdAt',
      page < Math.ceil(totalItems / limit),
      page > 1,
    );
  }

  async Update(
    id: string,
    fields: Partial<Pick<ProjectSnapshotEntity, 'name' | 'description'>>,
    entityManager?: EntityManager,
  ): Promise<void> {
    const repo = await this.GetRepository(entityManager);
    await repo.update(id, fields);
  }

  async SoftDelete(id: string, entityManager?: EntityManager): Promise<void> {
    const repo = await this.GetRepository(entityManager);
    await repo.update(id, { deletedAt: new Date() });
  }

  async FindById(
    id: string,
    includeData: boolean = true,
    entityManager?: EntityManager,
  ): Promise<ProjectSnapshotEntity | null> {
    const repo = await this.GetRepository(entityManager);

    if (includeData) {
      return repo.findOne({ where: { id, deletedAt: IsNull() } });
    }

    return repo
      .createQueryBuilder('s')
      .select([
        's.id',
        's.projectId',
        's.version',
        's.name',
        's.description',
        's.totalFiles',
        's.createdById',
        's.createdAt',
        's.updatedAt',
      ])
      .where('s.id = :id', { id })
      .andWhere('s.deletedAt IS NULL')
      .getOne();
  }

  async GetNextVersion(projectId: string): Promise<string> {
    const result = await this.repository
      .createQueryBuilder('s')
      .select('MAX(CAST(SUBSTRING(s.version, 2) AS INTEGER))', 'maxN')
      .where('s.projectId = :projectId', { projectId })
      .withDeleted()
      .getRawOne<{ maxN: number | null }>();

    return `v${(result?.maxN ?? 0) + 1}`;
  }
}
