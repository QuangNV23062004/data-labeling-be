import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decision } from '../enums/decisions.enums';

export class CreateReviewDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    description:
      'Reviewer ID (optional, will use authenticated user if not provided)',
  })
  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @ApiProperty({
    enum: Decision,
    description: 'Review decision (APPROVED, REJECTED, NEEDS_REVISION)',
  })
  @IsNotEmpty()
  @IsEnum(Decision)
  decision: Decision;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Feedback comments for the review',
  })
  @IsOptional()
  @IsString()
  feedbacks?: string;

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'Checklist answer ID (file label reference)',
  })
  @IsNotEmpty()
  @IsUUID()
  checklistAnswerId: string;
}
