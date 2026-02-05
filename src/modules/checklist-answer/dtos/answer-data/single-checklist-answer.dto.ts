import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class SingleChecklistAnswerDto {
  @ApiProperty({ type: 'string', format: 'uuid', name: 'questionId' })
  @IsUUID()
  questionId: string;

  @ApiProperty({ type: 'boolean', name: 'answer' })
  @IsBoolean()
  answer: boolean;

  @ApiProperty({ type: 'string', name: 'notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
