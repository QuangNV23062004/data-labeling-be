import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInstructionController } from './project-instruction.controller';
import { ProjectInstructionService } from './project-instruction.service';
import { ProjectInstructionRepository } from './project-instruction.repository';
import { ProjectInstructionEntity } from './project-instruction.entity';
import { ProjectModule } from '../project/project.module';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectInstructionEntity]),
    ProjectModule,
    StorageModule,
  ],
  controllers: [ProjectInstructionController],
  providers: [ProjectInstructionService, ProjectInstructionRepository],
})
export class ProjectInstructionModule {}
