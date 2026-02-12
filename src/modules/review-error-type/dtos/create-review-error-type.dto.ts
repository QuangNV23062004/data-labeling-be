import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Severity } from '../enums/severity.enums';

export class CreateReviewErrorTypeDto {
  @ApiProperty({
    description: 'Name of the review error type',
    example: 'Missing Label',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the error type',
    example: 'Indicates when a required label is missing from the annotation',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Severity level of the error type',
    enum: Severity,
    example: Severity.MODERATE,
  })
  @IsNotEmpty()
  @IsEnum(Severity)
  severity: Severity;

  @ApiProperty({
    description:
      'Impact on the overall review score (can be positive or negative)',
    example: -10,
    type: 'integer',
  })
  @IsNotEmpty()
  @IsInt()
  scoreImpact: number;
}
