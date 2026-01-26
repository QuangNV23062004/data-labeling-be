import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectTaskController } from './project-task.controller';
import { ProjectTaskService } from './project-task.service';
import { ProjectTaskRepository } from './project-task.repository';
import { ProjectTaskEntity } from './project-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectTaskEntity])],
  controllers: [ProjectTaskController],
  providers: [ProjectTaskService, ProjectTaskRepository],
})
export class ProjectTaskModule {}
