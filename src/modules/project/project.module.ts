import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { ProjectEntity } from './project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity])],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
})
export class ProjectModule {}
