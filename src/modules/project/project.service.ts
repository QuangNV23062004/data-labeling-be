import { HttpException, Injectable } from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { CreateProjectDto } from './dtos/create-project.dto';
import { ProjectEntity } from './project.entity';
import { ProjectStatus } from './enums/project-status.enums';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { FilterProjectQueryDto } from './dtos/filter-project-query.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async Create(request: CreateProjectDto, userId : string):Promise<ProjectEntity>{
    const projectEntity : Partial<ProjectEntity> = {
      name: request.name,
      description: request.description,
      dataType: request.dataType,
      createdById: userId,

      projectStatus: ProjectStatus.ACTIVE,
    };
    return await this.projectRepository.Create(projectEntity as ProjectEntity);
  }

  async Update(project: UpdateProjectDto):Promise<ProjectEntity>{
    let entity = await this.projectRepository.FindById(project.id);

    if (entity == null)
      throw new HttpException('NOT_FOUND', 404);
    entity.name = project.name ?? entity.name;
    entity.description = project.description ?? entity.description;
    entity.dataType = project.dataType ?? entity.dataType;
    return await this.projectRepository.Update(entity);
  }

  async Delete(projectId: string):Promise<void>{
    await this.projectRepository.SoftDelete(projectId);
  }

  async GetById(projectId: string, includeDeleted: boolean = false):Promise<ProjectEntity | null>{
    let entity = await this.projectRepository.FindById(projectId, includeDeleted);
    return entity;
  }
  
  async GetPaginated(query: FilterProjectQueryDto): Promise<ProjectEntity[]> {
    return await this.projectRepository.FindPaginated(query);
  }
}
