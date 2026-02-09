import { Module } from '@nestjs/common';
import { ChecklistAnswerController } from './checklist-answer.controller';
import { ChecklistAnswerService } from './checklist-answer.service';
import { ChecklistAnswerRepository } from './checklist-answer.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelChecklistQuestionModule } from '../label-checklist-question/label-checklist-question.module';
import { ChecklistAnswerEntity } from './checklist-answer.entity';
import { FileLabelModule } from '../file-label/file-label.module';
import { ChecklistAnswerDomain } from './checklist-answer.domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChecklistAnswerEntity]),
    LabelChecklistQuestionModule,
    FileLabelModule,
  ],
  controllers: [ChecklistAnswerController],
  providers: [
    ChecklistAnswerService,
    ChecklistAnswerRepository,
    ChecklistAnswerDomain,
  ],
  exports: [ChecklistAnswerService, ChecklistAnswerRepository],
})
export class ChecklistAnswerModule {}
