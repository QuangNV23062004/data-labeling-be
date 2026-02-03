import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelChecklistQuestionController } from './label-checklist-question.controller';
import { LabelChecklistQuestionService } from './label-checklist-question.service';
import { LabelChecklistQuestionRepository } from './label-checklist-question.repository';
import { LabelChecklistQuestionEntity } from './label-checklist-question.entity';
import { LabelModule } from '../label/label.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LabelChecklistQuestionEntity]),
    LabelModule,
  ],
  controllers: [LabelChecklistQuestionController],
  providers: [LabelChecklistQuestionService, LabelChecklistQuestionRepository],
})
export class LabelChecklistQuestionModule {}
