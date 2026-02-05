import { Module } from '@nestjs/common';
import { ChecklistAnswerController } from './checklist-answer.controller';
import { ChecklistAnswerService } from './checklist-answer.service';
import { ChecklistAnswerRepository } from './checklist-answer.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelChecklistQuestionModule } from '../label-checklist-question/label-checklist-question.module';
import { ChecklistAnswerEntity } from './checklist-answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChecklistAnswerEntity]),
    LabelChecklistQuestionModule,
  ],
  controllers: [ChecklistAnswerController],
  providers: [ChecklistAnswerService, ChecklistAnswerRepository],
  exports: [ChecklistAnswerService, ChecklistAnswerRepository],
})
export class ChecklistAnswerModule {}
