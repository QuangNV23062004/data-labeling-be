import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectTaskController } from './project-task.controller';
import { ProjectTaskService } from './project-task.service';
import { ProjectTaskRepository } from './project-task.repository';
import { ProjectTaskEntity } from './project-task.entity';
import { ProjectModule } from '../project/project.module';
import { AccountModule } from '../account/account.module';
import { FileModule } from '../file/file.module';
import { FileLabelModule } from '../file-label/file-label.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectTaskEntity]),
    ProjectModule,
    AccountModule,
    FileModule,
    FileLabelModule,
  ],
  controllers: [ProjectTaskController],
  providers: [ProjectTaskService, ProjectTaskRepository],
})
export class ProjectTaskModule {}
