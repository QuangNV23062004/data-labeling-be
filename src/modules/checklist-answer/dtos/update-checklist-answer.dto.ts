import { PartialType } from '@nestjs/swagger';
import { CreateChecklistAnswerDto } from './create-checklist-answer.dto';

export class UpdateChecklistAnswerDto extends PartialType(CreateChecklistAnswerDto) {}
