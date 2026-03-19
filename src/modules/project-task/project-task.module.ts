import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectTaskController } from './project-task.controller';
import { ProjectTaskService } from './project-task.service';
import { ProjectTaskRepository } from './project-task.repository';
import { ProjectTaskEntity } from './project-task.entity';
import { ProjectModule } from '../project/project.module';
import { AccountModule } from '../account/account.module';
import { FileModule } from '../file/file.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectTaskEntity]),
    forwardRef(() => ProjectModule),
    AccountModule,
    FileModule,
    NotificationModule,
  ],
  controllers: [ProjectTaskController],
  providers: [ProjectTaskService, ProjectTaskRepository],
  exports: [ProjectTaskService, ProjectTaskRepository],
})
export class ProjectTaskModule {}
