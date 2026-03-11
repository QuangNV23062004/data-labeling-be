import { Injectable } from '@nestjs/common';
import { ProjectTaskRepository } from './project-task.repository';
import { ProjectRepository } from '../project/project.repository';
import { AccountRepository } from '../account/account.repository';
import { FileRepository } from '../file/file.repository';
import { CreateProjectTaskDto } from './dtos/create-project-task.dto';
import { FilterProjectTaskQueryDto } from './dtos/filter-project-task-query.dto';
import { PatchProjectTaskDto } from './dtos/patch-project-task.dto';
import { ProjectTaskEntity } from './project-task.entity';
import { ProjectNotFoundException } from '../project/exceptions/project-exceptions.exception';
import {
  UserNotFoundException,
  MultipleFilesNotFoundException,
  ProjectTaskNotFoundException,
  InvalidProjectTaskException,
} from './exceptions/project-task-exceptions.exception';
import { ProjectTaskStatus } from './enums/task-status.enums';
import { ProjectTaskPriorityEnums } from './enums/task-priority.enums';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { Role } from '../account/enums/role.enum';
import { EntityManager } from 'typeorm';

@Injectable()
export class ProjectTaskService {
  constructor(
    private readonly projectTaskRepository: ProjectTaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly accountRepository: AccountRepository,
    private readonly fileRepository: FileRepository,
  ) {}

  async create(
    dto: CreateProjectTaskDto,
    managerUserId: string,
  ): Promise<ProjectTaskEntity> {
    const em = await this.projectTaskRepository.GetEntityManager();

    return em.transaction(async (transactionalEntityManager) => {
      // 1. Validate project exists
      const project = await this.projectRepository.FindById(
        dto.projectId,
        false,
        transactionalEntityManager,
      );
      if (!project) {
        throw new ProjectNotFoundException(dto.projectId);
      }

      // 2. Get manager user ID from JWT
      if (!managerUserId) {
        throw new UserNotFoundException('undefined', 'Manager User (from JWT)');
      }

      // Validate manager user exists
      const managerUser = await this.accountRepository.FindById(
        managerUserId,
        false,
        transactionalEntityManager,
      );
      if (!managerUser) {
        throw new UserNotFoundException(managerUserId, 'Manager User');
      }

      // 3. Validate assigned user exists and get their role
      const assignedUser = await this.accountRepository.FindById(
        dto.assignedUserId,
        false,
        transactionalEntityManager,
      );
      if (!assignedUser) {
        throw new UserNotFoundException(dto.assignedUserId, 'Assigned User');
      }

      // 4. Validate all file IDs exist
      const files = await this.fileRepository.FindByIds(
        dto.fileIds,
        false,
        transactionalEntityManager,
      );

      if (files.length !== dto.fileIds.length) {
        const foundFileIds = files.map((file) => file.id);
        const missingFileIds = dto.fileIds.filter(
          (id) => !foundFileIds.includes(id),
        );
        throw new MultipleFilesNotFoundException(missingFileIds);
      }

      // 5. Create the project task
      const projectTask = new ProjectTaskEntity();
      projectTask.projectId = dto.projectId;
      projectTask.assignedBy = managerUserId; // From JWT
      projectTask.assignedTo = dto.assignedUserId;
      projectTask.status = ProjectTaskStatus.ASSIGNED;
      projectTask.priority = ProjectTaskPriorityEnums.MEDIUM;
      projectTask.fileIds = dto.fileIds;
      projectTask.startedAt = null;
      projectTask.submittedAt = null;
      projectTask.completedAt = null;

      // Set assignedUserRole based on the user's role
      if (
        assignedUser.role === Role.ANNOTATOR ||
        assignedUser.role === Role.REVIEWER
      ) {
        projectTask.assignedUserRole = assignedUser.role;
      } else {
        throw new InvalidProjectTaskException(
          `Assigned user must have role of either ${Role.ANNOTATOR} or ${Role.REVIEWER}, but got ${assignedUser.role}`,
        );
      }

      const savedProjectTask = await this.projectTaskRepository.Create(
        projectTask,
        transactionalEntityManager,
      );

      await this.syncFileAssigneesFromTasks(
        transactionalEntityManager,
        dto.fileIds,
        [assignedUser.role as Role.ANNOTATOR | Role.REVIEWER],
      );

      return savedProjectTask;
    });
  }

  async FindPaginated(
    query: FilterProjectTaskQueryDto,
    includeDeleted: boolean = false,
  ): Promise<PaginationResultDto<ProjectTaskEntity>> {
    return this.projectTaskRepository.FindPaginated(query, includeDeleted);
  }

  async FindPaginatedForUser(
    userId: string,
    query: FilterProjectTaskQueryDto,
    includeDeleted: boolean = false,
  ): Promise<PaginationResultDto<ProjectTaskEntity>> {
    // Automatically filter by the logged-in user's ID
    const userQuery = { ...query, assignedToUserId: userId };
    return this.projectTaskRepository.FindPaginated(userQuery, includeDeleted);
  }

  async GetById(
    id: string,
    includeDeleted: boolean = false,
  ): Promise<ProjectTaskEntity> {
    const projectTask = await this.projectTaskRepository.FindById(
      id,
      includeDeleted,
    );

    if (!projectTask) {
      throw new ProjectTaskNotFoundException(id);
    }

    return projectTask;
  }

  async Patch(
    id: string,
    dto: PatchProjectTaskDto,
  ): Promise<ProjectTaskEntity> {
    const em = await this.projectTaskRepository.GetEntityManager();

    return em.transaction(async (transactionalEntityManager) => {
      // 1. Validate project task exists
      const projectTask = await this.projectTaskRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );
      if (!projectTask) {
        throw new ProjectTaskNotFoundException(id);
      }

      const previousAssignedRole = projectTask.assignedUserRole;
      const previousFileIds = [...projectTask.fileIds];

      // 2. Validate assigned user exists and update fields (if provided)
      if (dto.assignedUserId) {
        const assignedUser = await this.accountRepository.FindById(
          dto.assignedUserId,
          false,
          transactionalEntityManager,
        );
        if (!assignedUser) {
          throw new UserNotFoundException(dto.assignedUserId, 'Assigned User');
        }
        projectTask.assignedTo = dto.assignedUserId;

        // Update assignedUserRole based on the user's role
        if (
          assignedUser.role === Role.ANNOTATOR ||
          assignedUser.role === Role.REVIEWER
        ) {
          projectTask.assignedUserRole = assignedUser.role;
        } else {
          projectTask.assignedUserRole = null;
        }
      }

      // 3. Validate and add file IDs (if provided)
      if (dto.fileIdsToAdd && dto.fileIdsToAdd.length > 0) {
        const filesToAdd = await this.fileRepository.FindByIds(
          dto.fileIdsToAdd,
          false,
          transactionalEntityManager,
        );

        if (filesToAdd.length !== dto.fileIdsToAdd.length) {
          const foundFileIds = filesToAdd.map((file) => file.id);
          const missingFileIds = dto.fileIdsToAdd.filter(
            (id) => !foundFileIds.includes(id),
          );
          throw new MultipleFilesNotFoundException(missingFileIds);
        }

        // Add new file IDs to the task (avoid duplicates)
        const existingFileIds = new Set(projectTask.fileIds);
        dto.fileIdsToAdd.forEach((fileId) => existingFileIds.add(fileId));
        projectTask.fileIds = Array.from(existingFileIds);
      }

      // 4. Validate and remove file IDs (if provided)
      if (dto.fileIdsToRemove && dto.fileIdsToRemove.length > 0) {
        const filesToRemove = await this.fileRepository.FindByIds(
          dto.fileIdsToRemove,
          false,
          transactionalEntityManager,
        );

        if (filesToRemove.length !== dto.fileIdsToRemove.length) {
          const foundFileIds = filesToRemove.map((file) => file.id);
          const missingFileIds = dto.fileIdsToRemove.filter(
            (id) => !foundFileIds.includes(id),
          );
          throw new MultipleFilesNotFoundException(missingFileIds);
        }

        // Remove file IDs from the task
        const fileIdsToRemoveSet = new Set(dto.fileIdsToRemove);
        projectTask.fileIds = projectTask.fileIds.filter(
          (fileId) => !fileIdsToRemoveSet.has(fileId),
        );
      }

      // Check that the final file IDs list is not empty
      if (projectTask.fileIds.length === 0) {
        throw new InvalidProjectTaskException(
          'A task must have at least one file assigned',
        );
      }

      if (dto.status) {
        projectTask.status = dto.status;
      }

      // 5. Save the updated project task
      const repository = await this.projectTaskRepository.GetRepository(
        transactionalEntityManager,
      );
      const updatedProjectTask = await repository.save(projectTask);

      const impactedFileIds = Array.from(
        new Set([...previousFileIds, ...updatedProjectTask.fileIds]),
      );

      const rolesToSync = new Set<Role.ANNOTATOR | Role.REVIEWER>();
      if (
        previousAssignedRole === Role.ANNOTATOR ||
        previousAssignedRole === Role.REVIEWER
      ) {
        rolesToSync.add(previousAssignedRole);
      }
      if (
        updatedProjectTask.assignedUserRole === Role.ANNOTATOR ||
        updatedProjectTask.assignedUserRole === Role.REVIEWER
      ) {
        rolesToSync.add(updatedProjectTask.assignedUserRole);
      }

      await this.syncFileAssigneesFromTasks(
        transactionalEntityManager,
        impactedFileIds,
        Array.from(rolesToSync),
      );

      return updatedProjectTask;
    });
  }

  async Delete(id: string): Promise<void> {
    const em = await this.projectTaskRepository.GetEntityManager();
    await em.transaction(async (transactionalEntityManager) => {
      const projectTask = await this.projectTaskRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      if (!projectTask) {
        throw new ProjectTaskNotFoundException(id);
      }

      const deleted = await this.projectTaskRepository.Delete(
        id,
        transactionalEntityManager,
      );

      if (!deleted) {
        throw new ProjectTaskNotFoundException(id);
      }

      if (
        projectTask.assignedUserRole === Role.ANNOTATOR ||
        projectTask.assignedUserRole === Role.REVIEWER
      ) {
        await this.syncFileAssigneesFromTasks(
          transactionalEntityManager,
          projectTask.fileIds,
          [projectTask.assignedUserRole],
        );
      }
    });
  }

  private async findLatestTaskAssigneeForFileByRole(
    em: EntityManager,
    fileId: string,
    role: Role.ANNOTATOR | Role.REVIEWER,
  ): Promise<string | null> {
    const repository = await this.projectTaskRepository.GetRepository(em);

    const task = await repository
      .createQueryBuilder('projectTask')
      .where('projectTask.deletedAt IS NULL')
      .andWhere('projectTask.assignedUserRole = :role', { role })
      .andWhere(':fileId = ANY(projectTask.fileIds)', { fileId })
      .orderBy('projectTask.updatedAt', 'DESC')
      .addOrderBy('projectTask.createdAt', 'DESC')
      .getOne();

    return task?.assignedTo ?? null;
  }

  private async syncFileAssigneesFromTasks(
    em: EntityManager,
    fileIds: string[],
    roles: Array<Role.ANNOTATOR | Role.REVIEWER>,
  ): Promise<void> {
    if (!fileIds.length || !roles.length) {
      return;
    }

    const uniqueFileIds = Array.from(new Set(fileIds));

    for (const fileId of uniqueFileIds) {
      const updateData: {
        annotatorId?: string | null;
        reviewerId?: string | null;
      } = {};

      for (const role of roles) {
        const assigneeId = await this.findLatestTaskAssigneeForFileByRole(
          em,
          fileId,
          role,
        );

        if (role === Role.ANNOTATOR) {
          updateData.annotatorId = assigneeId;
        } else if (role === Role.REVIEWER) {
          updateData.reviewerId = assigneeId;
        }
      }

      await this.fileRepository.BatchUpdate([fileId], updateData, em);
    }
  }
}
