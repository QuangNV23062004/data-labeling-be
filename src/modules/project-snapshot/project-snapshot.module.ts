import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectSnapshotController } from './project-snapshot.controller';
import { ProjectSnapshotService } from './project-snapshot.service';
import { ProjectSnapshotRepository } from './project-snapshot.repository';
import { ProjectSnapshotEntity } from './project-snapshot.entity';
import { ProjectModule } from '../project/project.module';
import { FileEntity } from '../file/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectSnapshotEntity, FileEntity]),
    ProjectModule,
  ],
  controllers: [ProjectSnapshotController],
  providers: [ProjectSnapshotService, ProjectSnapshotRepository],
  exports: [ProjectSnapshotRepository],
})
export class ProjectSnapshotModule {}
