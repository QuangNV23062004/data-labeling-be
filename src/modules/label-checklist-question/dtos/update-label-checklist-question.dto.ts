import { PartialType } from '@nestjs/swagger';
import { CreateLabelChecklistQuestionDto } from './create-label-checklist-question.dto';

export class UpdateLabelChecklistQuestionDto extends PartialType(
  CreateLabelChecklistQuestionDto,
) {}
