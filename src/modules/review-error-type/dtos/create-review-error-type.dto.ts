import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Severity } from '../enums/severity.enums';

export class CreateReviewErrorTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(Severity)
  severity: Severity;

  @IsNotEmpty()
  @IsInt()
  scoreImpact: number;
}
