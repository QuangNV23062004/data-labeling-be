import { PartialType } from '@nestjs/swagger';
import { CreateLabelChecklistQuestionAnswerDto } from './create-label-checklist-question-answer.dto';

export class UpdateLabelChecklistQuestionAnswerDto extends PartialType(CreateLabelChecklistQuestionAnswerDto) {}
