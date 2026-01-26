import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInstructionController } from './project-instruction.controller';
import { ProjectInstructionService } from './project-instruction.service';
import { ProjectInstructionRepository } from './project-instruction.repository';
import { ProjectInstructionEntity } from './project-instruction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectInstructionEntity])],
  controllers: [ProjectInstructionController],
  providers: [ProjectInstructionService, ProjectInstructionRepository],
})
export class ProjectInstructionModule {}
