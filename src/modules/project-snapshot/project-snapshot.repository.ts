import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectSnapshotEntity } from './project-snapshot.entity';
@Injectable()
export class ProjectSnapshotRepository extends BaseRepository<ProjectSnapshotEntity> {
  constructor(@InjectRepository(ProjectSnapshotEntity)
      repository: Repository<ProjectSnapshotEntity>,) {
    super(repository, ProjectSnapshotEntity);
  }
}
