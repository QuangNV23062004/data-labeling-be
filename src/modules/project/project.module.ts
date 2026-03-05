import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { ProjectEntity } from './project.entity';
import { StorageModule } from 'src/common/storage/storage.module';
import { ProjectConfigurationModule } from '../project-configuration/project-configuration.module';
import { FileLabelModule } from '../file-label/file-label.module';
import { ReviewErrorModule } from '../review-error/review-error.module';
import { AccountRatingModule } from '../account-rating/account-rating.module';
import { AccountRatingHistoryModule } from '../account-rating-history/account-rating-history.module';
import { AccountModule } from '../account/account.module';
import { ProjectDomain } from './project.domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEntity]),
    StorageModule,
    ProjectConfigurationModule,
    forwardRef(() => FileLabelModule),
    ReviewErrorModule,
    AccountModule,
    AccountRatingModule,
    AccountRatingHistoryModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository, ProjectDomain],
  exports: [ProjectService, ProjectRepository, ProjectDomain],
})
export class ProjectModule {}
