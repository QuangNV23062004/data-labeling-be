import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectConfigurationEntity } from './project-configuration.entity';
@Injectable()
export class ProjectConfigurationRepository extends BaseRepository<ProjectConfigurationEntity> {
  constructor(
    @InjectRepository(ProjectConfigurationEntity)
    repository: Repository<ProjectConfigurationEntity>,
  ) {
    super(repository, ProjectConfigurationEntity);
  }
}
