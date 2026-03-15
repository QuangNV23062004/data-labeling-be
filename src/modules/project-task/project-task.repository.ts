import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ProjectTaskEntity } from './project-task.entity';
import { FilterProjectTaskQueryDto } from './dtos/filter-project-task-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { ProjectTaskStatus } from './enums/task-status.enums';
import { Role } from '../account/enums/role.enum';

@Injectable()
export class ProjectTaskRepository extends BaseRepository<ProjectTaskEntity> {
  constructor(
    @InjectRepository(ProjectTaskEntity)
    repository: Repository<ProjectTaskEntity>,
  ) {
    super(repository, ProjectTaskEntity);
  }

  async Update(
    projectTask: ProjectTaskEntity,
    entityManager?: EntityManager,
  ): Promise<ProjectTaskEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(projectTask);
  }
  async Create(
    projectTask: ProjectTaskEntity,
    entityManager?: EntityManager,
  ): Promise<ProjectTaskEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(projectTask);
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    entityManager?: EntityManager,
  ): Promise<ProjectTaskEntity | null> {
    const repository = await this.GetRepository(entityManager);

    const qb = repository
      .createQueryBuilder('projectTask')
      .leftJoinAndSelect('projectTask.project', 'project')
      .where('projectTask.id = :id', { id });

    if (!includeDeleted) {
      qb.andWhere('projectTask.deletedAt IS NULL').andWhere(
        'project.deletedAt IS NULL',
      );
    }

    return qb.getOne();
  }

  async FindLatestByProjectAssigneeAndRole(
    projectId: string,
    assignedTo: string,
    assignedUserRole: Role.ANNOTATOR | Role.REVIEWER,
    includeDeleted: boolean = false,
    includeDone: boolean = false,
    entityManager?: EntityManager,
  ): Promise<ProjectTaskEntity | null> {
    const repository = await this.GetRepository(entityManager);

    const qb = repository
      .createQueryBuilder('projectTask')
      .where('projectTask.projectId = :projectId', { projectId })
      .andWhere('projectTask.assignedTo = :assignedTo', { assignedTo })
      .andWhere('projectTask.assignedUserRole = :assignedUserRole', {
        assignedUserRole,
      });

    if (!includeDeleted) {
      qb.andWhere('projectTask.deletedAt IS NULL');
    }

    if (!includeDone) {
      qb.andWhere('projectTask.status <> :doneStatus', {
        doneStatus: ProjectTaskStatus.DONE,
      });
    }

    qb.orderBy('projectTask.updatedAt', 'DESC').addOrderBy(
      'projectTask.createdAt',
      'DESC',
    );

    return qb.getOne();
  }

  async Delete(
    id: string,
    entityManager?: EntityManager,
  ): Promise<ProjectTaskEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const projectTask = await this.FindById(id, false, entityManager);

    if (!projectTask) {
      return null;
    }

    projectTask.deletedAt = new Date();
    return repository.save(projectTask);
  }

  async FindPaginated(
    query: FilterProjectTaskQueryDto,
    includeDeleted: boolean = false,
    includeDone: boolean = false,
    em?: EntityManager,
  ): Promise<PaginationResultDto<ProjectTaskEntity>> {
    const repository = await this.GetRepository(em);
    const qb = repository
      .createQueryBuilder('projectTask')
      .innerJoinAndSelect('projectTask.project', 'project');

    if (!includeDeleted) {
      qb.andWhere('projectTask.deletedAt IS NULL').andWhere(
        'project.deletedAt IS NULL',
      );
    }

    // Apply filters
    if (query?.projectId) {
      qb.andWhere('projectTask.projectId = :projectId', {
        projectId: query.projectId,
      });
    }

    if (query?.status) {
      qb.andWhere('projectTask.status = :status', { status: query.status });
    } else {
      qb.andWhere('projectTask.status <> :doneStatus', {
        doneStatus: ProjectTaskStatus.DONE,
      });
    }

    if (query?.assignedByUserId) {
      qb.andWhere('projectTask.assignedBy = :assignedBy', {
        assignedBy: query.assignedByUserId,
      });
    }

    if (query?.assignedToUserId) {
      qb.andWhere('projectTask.assignedTo = :assignedTo', {
        assignedTo: query.assignedToUserId,
      });
    }

    // Apply ordering
    if (query?.orderBy && query?.order) {
      qb.orderBy(
        `projectTask.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      qb.orderBy('projectTask.createdAt', 'DESC');
    }

    const totalItems = await qb.getCount();

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<ProjectTaskEntity>(
      items,
      Math.ceil(totalItems / limit),
      page,
      limit,
      '',
      '',
      query?.order || 'DESC',
      query?.orderBy || 'createdAt',
      page < Math.ceil(totalItems / limit),
      page > 1,
      {
        projectId: query?.projectId,
        status: query?.status,
        assignedByUserId: query?.assignedByUserId,
        assignedToUserId: query?.assignedToUserId,
      },
    );
  }

  async MarkAllAsDoneByProjectId(
    projectId: string,
    entityManager?: EntityManager,
  ): Promise<void> {
    const repository = await this.GetRepository(entityManager);

    await repository
      .createQueryBuilder()
      .update(ProjectTaskEntity)
      .set({
        status: ProjectTaskStatus.DONE,
        completedAt: new Date(),
      })
      .where('projectId = :projectId', { projectId })
      .andWhere('deletedAt IS NULL')
      .andWhere('status <> :doneStatus', {
        doneStatus: ProjectTaskStatus.DONE,
      })
      .execute();
  }
}
