import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectConfigurationController } from './project-configuration.controller';
import { ProjectConfigurationService } from './project-configuration.service';
import { ProjectConfigurationRepository } from './project-configuration.repository';
import { ProjectConfigurationEntity } from './project-configuration.entity';
import { ProjectEntity } from '../project/project.entity';
import { ProjectRepository } from '../project/project.repository';
import { LabelEntity } from '../label/label.entity';
import { LabelRepository } from '../label/label.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectConfigurationEntity, ProjectEntity, LabelEntity])],
  controllers: [ProjectConfigurationController],
  providers: [ProjectConfigurationService, ProjectConfigurationRepository, ProjectRepository, LabelRepository],
  exports: [ProjectConfigurationService, ProjectConfigurationRepository],
})
export class ProjectConfigurationModule {}
