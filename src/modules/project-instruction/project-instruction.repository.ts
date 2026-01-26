import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectInstructionEntity } from './project-instruction.entity';
@Injectable()
export class ProjectInstructionRepository extends BaseRepository<ProjectInstructionEntity> {
  constructor(
    @InjectRepository(ProjectInstructionEntity)
    repository: Repository<ProjectInstructionEntity>,
  ) {
    super(repository, ProjectInstructionEntity);
  }
}
