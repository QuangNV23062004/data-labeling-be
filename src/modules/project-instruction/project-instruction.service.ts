import { Injectable } from '@nestjs/common';
import { ProjectInstructionRepository } from './project-instruction.repository';
import { ProjectService } from '../project/project.service';
import { StorageService } from 'src/common/storage/storage.service';
import { CreateProjectInstructionDto } from './dtos/create-project-instruction.dto';
import { UpdateProjectInstructionDto } from './dtos/update-project-instruction.dto';
import { ProjectInstructionEntity } from './project-instruction.entity';
import { ProjectNotFoundException } from '../project/exceptions/project-exceptions.exception';
import { ProjectInstructionNotFoundException } from './exceptions/project-instruction-exceptions.exception';
import { ProjectRepository } from '../project/project.repository';

@Injectable()
export class ProjectInstructionService {
  constructor(
    private readonly projectInstructionRepository: ProjectInstructionRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly storageService: StorageService,
  ) {}

  async Create(
    dto: CreateProjectInstructionDto,
    file?: Express.Multer.File,
  ): Promise<ProjectInstructionEntity> {

    let entityManager = await this.projectInstructionRepository.GetEntityManager();
    return await entityManager.transaction(async (transactionalEntityManager) => {
      // Check if project exists
      let project = await this.projectRepository.FindById(dto.projectId, false, transactionalEntityManager);
      if (!project) {
        throw new ProjectNotFoundException(dto.projectId);
      }

      // Delete existing instruction if any
      let existingInstruction = await this.projectInstructionRepository.GetByProjectId(dto.projectId, transactionalEntityManager);
      if (existingInstruction)
        await this.projectInstructionRepository.Delete(existingInstruction.id);

      // Upload file to storage
        let attachmentUrl = file? await this.storageService.uploadFilePath(
          `project-instructions/${dto.projectId}`,
          file,
        ) : null;

      // Create project instruction entity
      let projectInstruction: Partial<ProjectInstructionEntity> = {
        projectId: dto.projectId,
        title: dto.title,
        content: dto.content,
        attachmentUrl: attachmentUrl,
      };

      return await this.projectInstructionRepository.Create(
        projectInstruction as ProjectInstructionEntity,
      );
    });
    
  }

  async Update(
    projectId: string,
    dto: UpdateProjectInstructionDto,
    file?: Express.Multer.File,
  ): Promise<ProjectInstructionEntity> {
    let entityManager = await this.projectInstructionRepository.GetEntityManager();
    return await entityManager.transaction(async (transactionalEntityManager) => {
      let entity = await this.projectInstructionRepository.GetByProjectId(projectId, transactionalEntityManager);
      if (!entity)
        throw new ProjectInstructionNotFoundException(projectId);

      entity.title = dto.title;
      entity.content = dto.content;

      // Upload new file if provided
      if (file) {
        if (entity.attachmentUrl) {
          await this.storageService.deleteBlob([entity.attachmentUrl]);
        }
        entity.attachmentUrl = await this.storageService.uploadFilePath(
          `project-instructions/${entity.projectId}`,
          file,
        );
      }

      return await this.projectInstructionRepository.Update(entity, transactionalEntityManager);
    });
  }

  async UpdateFile(
    projectId: string,
    file: Express.Multer.File,
  ): Promise<ProjectInstructionEntity> {
    let entityManager = await this.projectInstructionRepository.GetEntityManager();
    return await entityManager.transaction(async (transactionalEntityManager) => {
      let entity = await this.projectInstructionRepository.GetByProjectId(projectId, transactionalEntityManager);
      if (!entity) {
        throw new ProjectInstructionNotFoundException(projectId);
      }

      // Upload new file
      if (entity.attachmentUrl) {
        await this.storageService.deleteBlob([entity.attachmentUrl]);
      }

      if (file){
        entity.attachmentUrl = await this.storageService.uploadFilePath(
        `project-instructions/${entity.projectId}`,
        file,
      );
      }
      return await this.projectInstructionRepository.Update(entity, transactionalEntityManager);
    });
  }

  async GetByProjectId(projectId: string): Promise<ProjectInstructionEntity> {
    let entity = await this.projectInstructionRepository.GetByProjectId(projectId);
    if (!entity) {
      throw new ProjectInstructionNotFoundException(projectId);
    }
    return entity;
  }

  async DeleteFile(projectId: string): Promise<void> {
    let entityManager = await this.projectInstructionRepository.GetEntityManager();
    await entityManager.transaction(async (transactionalEntityManager) => {
      // Get project instruction
      let entity = await this.projectInstructionRepository.GetByProjectId(projectId, transactionalEntityManager);
      if (!entity) {
        throw new ProjectInstructionNotFoundException(projectId);
      }
      if (entity.attachmentUrl) {
        await this.storageService.deleteBlob([entity.attachmentUrl]);
      }
      entity.attachmentUrl = null;
      await this.projectInstructionRepository.Update(entity, transactionalEntityManager);
    });
  } 
}
