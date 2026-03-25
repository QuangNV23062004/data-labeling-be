import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileLabelController } from './file-label.controller';
import { FileLabelService } from './file-label.service';
import { FileLabelRepository } from './file-label.repository';
import { FileLabelEntity } from './file-label.entity';
import { FileModule } from '../file/file.module';
import { LabelModule } from '../label/label.module';
import { FileLabelDomain } from './file-label.domain';
import { ChecklistAnswerModule } from '../checklist-answer/checklist-answer.module';
import { LabelChecklistQuestionModule } from '../label-checklist-question/label-checklist-question.module';
import { ProjectConfigurationModule } from '../project-configuration/project-configuration.module';
import { GeminiModule } from 'src/common/gemini/gemini.module';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileLabelEntity]),
    forwardRef(() => FileModule),
    LabelModule,
    LabelChecklistQuestionModule,
    ProjectConfigurationModule,
    forwardRef(() => ChecklistAnswerModule),
    GeminiModule,
    StorageModule,
  ],
  controllers: [FileLabelController],
  providers: [FileLabelService, FileLabelRepository, FileLabelDomain],
  exports: [FileLabelService, FileLabelRepository, FileLabelDomain],
})
export class FileLabelModule {}
