import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectConfigurationController } from './project-configuration.controller';
import { ProjectConfigurationService } from './project-configuration.service';
import { ProjectConfigurationRepository } from './project-configuration.repository';
import { ProjectConfigurationEntity } from './project-configuration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectConfigurationEntity])],
  controllers: [ProjectConfigurationController],
  providers: [ProjectConfigurationService, ProjectConfigurationRepository],
})
export class ProjectConfigurationModule {}
