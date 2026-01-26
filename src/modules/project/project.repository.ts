import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from './project.entity';

@Injectable()
export class ProjectRepository extends BaseRepository<ProjectEntity> {
  constructor(
    @InjectRepository(ProjectEntity)
    repository: Repository<ProjectEntity>,
  ) {
    super(repository, ProjectEntity);
  }
}
