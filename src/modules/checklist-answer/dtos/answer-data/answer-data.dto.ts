import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SingleChecklistAnswerDto } from './single-checklist-answer.dto';
import { Type } from 'class-transformer';

export class AnswerDataDto {
  @ApiProperty({
    type: () => [SingleChecklistAnswerDto],
    description: 'Array of answers to checklist questions',
    example: [
      {
        questionId: '550e8400-e29b-41d4-a716-446655440000',
        answer: true,
        notes: 'Sample note',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleChecklistAnswerDto)
  answers: SingleChecklistAnswerDto[];

  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Optional notes for the entire answer set',
    example: 'All items verified successfully',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
