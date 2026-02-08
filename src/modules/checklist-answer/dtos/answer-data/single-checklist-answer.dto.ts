import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class SingleChecklistAnswerDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'ID of the checklist question being answered',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  questionId: string;

  @ApiProperty({
    type: 'boolean',
    description: 'The answer value: true (yes/approved) or false (no/rejected)',
    example: true,
  })
  @IsBoolean()
  answer: boolean;

  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Optional notes explaining the answer',
    example: 'Item has correct markings',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
