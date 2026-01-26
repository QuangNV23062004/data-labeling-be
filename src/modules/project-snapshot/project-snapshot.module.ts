import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectSnapshotController } from './project-snapshot.controller';
import { ProjectSnapshotService } from './project-snapshot.service';
import { ProjectSnapshotRepository } from './project-snapshot.repository';
import { ProjectSnapshotEntity } from './project-snapshot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectSnapshotEntity])],
  controllers: [ProjectSnapshotController],
  providers: [ProjectSnapshotService, ProjectSnapshotRepository],
})
export class ProjectSnapshotModule {}
