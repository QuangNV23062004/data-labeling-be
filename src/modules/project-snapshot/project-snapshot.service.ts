import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ProjectRepository } from '../project/project.repository';
import { ProjectNotFoundException } from '../project/exceptions/project-exceptions.exception';
import { ProjectSnapshotRepository } from './project-snapshot.repository';
import { ProjectSnapshotEntity } from './project-snapshot.entity';
import { CreateProjectSnapshotDto } from './dtos/create-project-snapshot.dto';
import { FilterProjectSnapshotQueryDto } from './dtos/filter-project-snapshot-query.dto';
import { UpdateProjectSnapshotDto } from './dtos/update-project-snapshot.dto';
import { FileEntity } from '../file/file.entity';
import { FileLabelStatusEnums } from '../file-label/enums/file-label.enums';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { ProjectSnapshotNotFoundException } from './exceptions/project-snapshot-exceptions.exception';

@Injectable()
export class ProjectSnapshotService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly snapshotRepository: ProjectSnapshotRepository,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async CreateSnapshot(
    projectId: string,
    dto: CreateProjectSnapshotDto,
    creatorId: string,
  ): Promise<ProjectSnapshotEntity> {
    const project = await this.projectRepository.FindById(projectId);
    if (!project) {
      throw new ProjectNotFoundException(projectId);
    }

    const version = await this.snapshotRepository.GetNextVersion(projectId);

    const files = await this.fileRepository.find({
      where: { projectId, deletedAt: IsNull() },
      relations: ['fileLabels', 'fileLabels.label'],
    });

    const snapshotFiles = files.map((file) => ({
      id: file.id,
      name: file.fileName,
      url: file.fileUrl,
      labels: file.fileLabels
        .filter(
          (fl) =>
            fl.status === FileLabelStatusEnums.APPROVED ||
            fl.status === FileLabelStatusEnums.DONE,
        )
        .map((fl) => ({
          id: fl.id,
          labelId: fl.labelId,
          labelName: fl.label?.name ?? null,
          annotationData: fl.annotationData ?? null,
        })),
    }));

    const snapshot = new ProjectSnapshotEntity();
    snapshot.projectId = projectId;
    snapshot.version = version;
    snapshot.name = dto.name;
    if (dto.description !== undefined) snapshot.description = dto.description;
    snapshot.snapshotData = { files: snapshotFiles };
    snapshot.totalFiles = files.length;
    snapshot.createdById = creatorId;

    return this.snapshotRepository.Create(snapshot);
  }

  async GetPaginated(
    projectId: string,
    query: FilterProjectSnapshotQueryDto,
  ): Promise<PaginationResultDto<Omit<ProjectSnapshotEntity, 'snapshotData'>>> {
    const project = await this.projectRepository.FindById(projectId);
    if (!project) {
      throw new ProjectNotFoundException(projectId);
    }

    return this.snapshotRepository.FindPaginated(projectId, query);
  }

  async GetById(
    id: string,
    includeData: boolean = true,
  ): Promise<ProjectSnapshotEntity> {
    const entity = await this.snapshotRepository.FindById(id, includeData);
    if (!entity) {
      throw new ProjectSnapshotNotFoundException(id);
    }
    return entity;
  }

  async UpdateSnapshot(
    id: string,
    dto: UpdateProjectSnapshotDto,
  ): Promise<Omit<ProjectSnapshotEntity, 'snapshotData'>> {
    const entity = await this.snapshotRepository.FindById(id, false);
    if (!entity) {
      throw new ProjectSnapshotNotFoundException(id);
    }
    const fields: Partial<Pick<ProjectSnapshotEntity, 'name' | 'description'>> = {};
    if (dto.name !== undefined) fields.name = dto.name;
    if (dto.description !== undefined) fields.description = dto.description;
    await this.snapshotRepository.Update(id, fields);
    return this.snapshotRepository.FindById(id, false) as Promise<Omit<ProjectSnapshotEntity, 'snapshotData'>>;
  }

  async DeleteSnapshot(id: string): Promise<void> {
    const entity = await this.snapshotRepository.FindById(id, false);
    if (!entity) {
      throw new ProjectSnapshotNotFoundException(id);
    }
    await this.snapshotRepository.SoftDelete(id);
  }
}
