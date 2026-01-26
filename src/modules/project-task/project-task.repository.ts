import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectTaskEntity } from './project-task.entity';
@Injectable()
export class ProjectTaskRepository extends BaseRepository<ProjectTaskEntity> {
  constructor(
    @InjectRepository(ProjectTaskEntity)
    repository: Repository<ProjectTaskEntity>,
  ) {
    super(repository, ProjectTaskEntity);
  }
}
