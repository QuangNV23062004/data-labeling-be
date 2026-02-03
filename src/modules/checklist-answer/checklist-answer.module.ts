import { Module } from '@nestjs/common';
import { ChecklistAnswerController } from './checklist-answer.controller';
import { ChecklistAnswerService } from './checklist-answer.service';

@Module({
  controllers: [ChecklistAnswerController],
  providers: [ChecklistAnswerService]
})
export class ChecklistAnswerModule {}
