import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SingleChecklistAnswerDto } from './single-checklist-answer.dto';
import { Type } from 'class-transformer';

export class AnswerDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleChecklistAnswerDto)
  answers: SingleChecklistAnswerDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
