import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelChecklistQuestionAnswerController } from './label-checklist-question-answer.controller';
import { LabelChecklistQuestionAnswerService } from './label-checklist-question-answer.service';
import { LabelChecklistQuestionAnswerRepository } from './label-checklist-question-answer.repository';
import { LabelChecklistQuestionAnswerEntity } from './label-checklist-question-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LabelChecklistQuestionAnswerEntity])],
  controllers: [LabelChecklistQuestionAnswerController],
  providers: [
    LabelChecklistQuestionAnswerService,
    LabelChecklistQuestionAnswerRepository,
  ],
})
export class LabelChecklistQuestionAnswerModule {}
