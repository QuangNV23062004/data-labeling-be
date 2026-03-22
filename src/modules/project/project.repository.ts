import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, IsNull } from 'typeorm';
import { ProjectEntity } from './project.entity';
import { FilterProjectQueryDto } from './dtos/filter-project-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { ProjectStatus } from './enums/project-status.enums';
import { ProjectStatisticsDto } from './dtos/project-statistics.dto';
import { SingleChartStatisticDto } from './dtos/chart-statistic.dto';

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

  async GetChartStatisticsByInterval(
    startDate: Date,
    endDate: Date,
    intervalCount: number,
    createdById?: string,
    entityManager?: EntityManager,
  ): Promise<SingleChartStatisticDto[]> {
    const repository = await this.GetRepository(entityManager);
    const createdByCondition = createdById ? 'AND p.created_by_id = $4' : '';
    const params = createdById
      ? [
          startDate.toISOString(),
          endDate.toISOString(),
          intervalCount,
          createdById,
        ]
      : [startDate.toISOString(), endDate.toISOString(), intervalCount];

    const raw = await repository.query(
      `
      WITH bounds AS (
        SELECT
          $1::timestamptz AS start_date,
          $2::timestamptz AS end_date,
          GREATEST($3::int, 1) AS interval_count
      ),
      buckets AS (
        SELECT
          gs.idx,
          b.start_date
            + ((b.end_date - b.start_date) * gs.idx::double precision / b.interval_count) AS bucket_start,
          b.start_date
            + ((b.end_date - b.start_date) * (gs.idx + 1)::double precision / b.interval_count) AS bucket_end
        FROM bounds b
        CROSS JOIN LATERAL generate_series(0, b.interval_count - 1) AS gs(idx)
      )
      SELECT
        TO_CHAR(b.bucket_start AT TIME ZONE 'UTC', 'DD/MM/YYYY') AS date,
        COUNT(p.id)::int AS projects,
        COALESCE(SUM(CASE WHEN p.project_status = '${ProjectStatus.DRAFT}' THEN 1 ELSE 0 END), 0)::int AS "draftCount",
        COALESCE(SUM(CASE WHEN p.project_status = '${ProjectStatus.ACTIVE}' THEN 1 ELSE 0 END), 0)::int AS "activeCount",
        COALESCE(SUM(CASE WHEN p.project_status = '${ProjectStatus.COMPLETED}' THEN 1 ELSE 0 END), 0)::int AS "completedCount",
        COALESCE(SUM(CASE WHEN p.project_status = '${ProjectStatus.ARCHIVED}' THEN 1 ELSE 0 END), 0)::int AS "archivedCount"
      FROM buckets b
      JOIN bounds bd ON TRUE
      LEFT JOIN projects p
        ON p.deleted_at IS NULL
        AND p.created_at >= b.bucket_start
        AND (
          (b.idx = bd.interval_count - 1 AND p.created_at <= bd.end_date)
          OR (b.idx <> bd.interval_count - 1 AND p.created_at < b.bucket_end)
        )
        ${createdByCondition}
      GROUP BY b.idx, b.bucket_start
      ORDER BY b.idx ASC;
      `,
      params,
    );

    return raw.map(
      (row: {
        date: string;
        projects: number | string;
        draftCount: number | string;
        activeCount: number | string;
        completedCount: number | string;
        archivedCount: number | string;
      }) => ({
        date: row.date,
        projects: Number(row.projects ?? 0),
        details: {
          [ProjectStatus.DRAFT]: Number(row.draftCount ?? 0),
          [ProjectStatus.ACTIVE]: Number(row.activeCount ?? 0),
          [ProjectStatus.COMPLETED]: Number(row.completedCount ?? 0),
          [ProjectStatus.ARCHIVED]: Number(row.archivedCount ?? 0),
        },
      }),
    );
  }

  async GetChartStatisticsByDayRange(
    startDate: Date,
    endDate: Date,
    createdById?: string,
    entityManager?: EntityManager,
  ): Promise<SingleChartStatisticDto[]> {
    const repository = await this.GetRepository(entityManager);
    const createdByCondition = createdById ? 'AND p.created_by_id = $3' : '';
    const params = createdById
      ? [startDate.toISOString(), endDate.toISOString(), createdById]
      : [startDate.toISOString(), endDate.toISOString()];

    const raw = await repository.query(
      `
      WITH bounds AS (
        SELECT
          date_trunc('day', $1::timestamptz) AS start_date,
          date_trunc('day', $2::timestamptz) AS end_date
      ),
      buckets AS (
        SELECT
          gs AS bucket_start,
          gs + interval '1 day' AS bucket_end
        FROM bounds b
        CROSS JOIN LATERAL generate_series(
          b.start_date,
          b.end_date,
          interval '1 day'
        ) AS gs
      )
      SELECT
        TO_CHAR(b.bucket_start AT TIME ZONE 'UTC', 'DD/MM/YYYY') AS date,
        COUNT(p.id)::int AS projects,
        COALESCE(SUM(CASE WHEN p.project_status = '${ProjectStatus.DRAFT}' THEN 1 ELSE 0 END), 0)::int AS "draftCount",
        COALESCE(SUM(CASE WHEN p.project_status = '${ProjectStatus.ACTIVE}' THEN 1 ELSE 0 END), 0)::int AS "activeCount",
        COALESCE(SUM(CASE WHEN p.project_status = '${ProjectStatus.COMPLETED}' THEN 1 ELSE 0 END), 0)::int AS "completedCount",
        COALESCE(SUM(CASE WHEN p.project_status = '${ProjectStatus.ARCHIVED}' THEN 1 ELSE 0 END), 0)::int AS "archivedCount"
      FROM buckets b
      LEFT JOIN projects p
        ON p.deleted_at IS NULL
        AND p.created_at >= b.bucket_start
        AND p.created_at < b.bucket_end
        ${createdByCondition}
      GROUP BY b.bucket_start
      ORDER BY b.bucket_start ASC;
      `,
      params,
    );

    return raw.map(
      (row: {
        date: string;
        projects: number | string;
        draftCount: number | string;
        activeCount: number | string;
        completedCount: number | string;
        archivedCount: number | string;
      }) => ({
        date: row.date,
        projects: Number(row.projects ?? 0),
        details: {
          [ProjectStatus.DRAFT]: Number(row.draftCount ?? 0),
          [ProjectStatus.ACTIVE]: Number(row.activeCount ?? 0),
          [ProjectStatus.COMPLETED]: Number(row.completedCount ?? 0),
          [ProjectStatus.ARCHIVED]: Number(row.archivedCount ?? 0),
        },
      }),
    );
  }

  async GetChartStatisticsByMonthRange(
    startDate: Date,
    endDate: Date,
    createdById?: string,
    entityManager?: EntityManager,
  ): Promise<SingleChartStatisticDto[]> {
    const repository = await this.GetRepository(entityManager);
    const createdByCondition = createdById ? 'AND p.created_by_id = $3' : '';
    const params = createdById
      ? [startDate.toISOString(), endDate.toISOString(), createdById]
      : [startDate.toISOString(), endDate.toISOString()];

    const raw = await repository.query(
      `
      WITH bounds AS (
        SELECT
          date_trunc('month', $1::timestamptz) AS start_date,
          date_trunc('month', $2::timestamptz) AS end_date
      ),
      buckets AS (
        SELECT
          gs AS bucket_start,
          gs + interval '1 month' AS bucket_end
        FROM bounds b
        CROSS JOIN LATERAL generate_series(
          b.start_date,
          b.end_date,
          interval '1 month'
        ) AS gs
      )
      SELECT
        TO_CHAR(b.bucket_start AT TIME ZONE 'UTC', 'DD/MM/YYYY') AS date,
        COUNT(p.id)::int AS projects,
        COALESCE(SUM(CASE WHEN p.project_status = '${ProjectStatus.DRAFT}' THEN 1 ELSE 0 END), 0)::int AS "draftCount",
        COALESCE(SUM(CASE WHEN p.project_status = '${ProjectStatus.ACTIVE}' THEN 1 ELSE 0 END), 0)::int AS "activeCount",
        COALESCE(SUM(CASE WHEN p.project_status = '${ProjectStatus.COMPLETED}' THEN 1 ELSE 0 END), 0)::int AS "completedCount",
        COALESCE(SUM(CASE WHEN p.project_status = '${ProjectStatus.ARCHIVED}' THEN 1 ELSE 0 END), 0)::int AS "archivedCount"
      FROM buckets b
      LEFT JOIN projects p
        ON p.deleted_at IS NULL
        AND p.created_at >= b.bucket_start
        AND p.created_at < b.bucket_end
        ${createdByCondition}
      GROUP BY b.bucket_start
      ORDER BY b.bucket_start ASC;
      `,
      params,
    );

    return raw.map(
      (row: {
        date: string;
        projects: number | string;
        draftCount: number | string;
        activeCount: number | string;
        completedCount: number | string;
        archivedCount: number | string;
      }) => ({
        date: row.date,
        projects: Number(row.projects ?? 0),
        details: {
          [ProjectStatus.DRAFT]: Number(row.draftCount ?? 0),
          [ProjectStatus.ACTIVE]: Number(row.activeCount ?? 0),
          [ProjectStatus.COMPLETED]: Number(row.completedCount ?? 0),
          [ProjectStatus.ARCHIVED]: Number(row.archivedCount ?? 0),
        },
      }),
    );
  }

  async GetAllTimeYearlyChartStatistics(
    createdById?: string,
    entityManager?: EntityManager,
  ): Promise<SingleChartStatisticDto[]> {
    const repository = await this.GetRepository(entityManager);
    const createdByCondition = createdById ? 'AND p.created_by_id = $1' : '';
    const params = createdById ? [createdById] : [];

    const raw = await repository.query(
      `
      WITH filtered_projects AS (
        SELECT p.created_at, p.project_status
        FROM projects p
        WHERE p.deleted_at IS NULL
        ${createdByCondition}
      ),
      year_bounds AS (
        SELECT
          MIN(EXTRACT(YEAR FROM fp.created_at))::int AS min_year,
          MAX(EXTRACT(YEAR FROM fp.created_at))::int AS max_year
        FROM filtered_projects fp
      ),
      years AS (
        SELECT generate_series(yb.min_year, yb.max_year) AS year
        FROM year_bounds yb
        WHERE yb.min_year IS NOT NULL
      )
      SELECT
        y.year::text AS date,
        COUNT(fp.created_at)::int AS projects,
        COALESCE(SUM(CASE WHEN fp.project_status = '${ProjectStatus.DRAFT}' THEN 1 ELSE 0 END), 0)::int AS "draftCount",
        COALESCE(SUM(CASE WHEN fp.project_status = '${ProjectStatus.ACTIVE}' THEN 1 ELSE 0 END), 0)::int AS "activeCount",
        COALESCE(SUM(CASE WHEN fp.project_status = '${ProjectStatus.COMPLETED}' THEN 1 ELSE 0 END), 0)::int AS "completedCount",
        COALESCE(SUM(CASE WHEN fp.project_status = '${ProjectStatus.ARCHIVED}' THEN 1 ELSE 0 END), 0)::int AS "archivedCount"
      FROM years y
      LEFT JOIN filtered_projects fp
        ON EXTRACT(YEAR FROM fp.created_at)::int = y.year
      GROUP BY y.year
      ORDER BY y.year ASC;
      `,
      params,
    );

    return raw.map(
      (row: {
        date: string;
        projects: number | string;
        draftCount: number | string;
        activeCount: number | string;
        completedCount: number | string;
        archivedCount: number | string;
      }) => ({
        date: row.date,
        projects: Number(row.projects ?? 0),
        details: {
          [ProjectStatus.DRAFT]: Number(row.draftCount ?? 0),
          [ProjectStatus.ACTIVE]: Number(row.activeCount ?? 0),
          [ProjectStatus.COMPLETED]: Number(row.completedCount ?? 0),
          [ProjectStatus.ARCHIVED]: Number(row.archivedCount ?? 0),
        },
      }),
    );
  }
}
