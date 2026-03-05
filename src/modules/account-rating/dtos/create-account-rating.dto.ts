import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { CreateMode } from '../enums/create-mode.enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountRatingDto {
  @ApiProperty({
    description: 'Annotator account ID',
    format: 'uuid',
    example: '96b6d3f2-3e58-4be1-9bc2-0de3c2a2d890',
  })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @ApiProperty({
    description: 'Project ID',
    format: 'uuid',
    example: '2cf08fd8-cf3e-4e0f-aea8-b1f2ec6d8ae6',
  })
  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({
    description: 'Rating score (computed in service)',
    minimum: 0,
    maximum: 100,
    default: 100,
    example: 95,
  })
  @IsOptional()
  @IsInt()
  @Max(100)
  @Min(0)
  ratingScore?: number = 100; //all of these will be calculated in the service, so we can set default value here

  @ApiPropertyOptional({
    description: 'Error count (computed in service)',
    minimum: 0,
    default: 0,
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  errorCount?: number = 0; //all of these will be calculated in the service, so we can set default value here

  @ApiPropertyOptional({
    description: 'Total labeled files (computed in service)',
    minimum: 0,
    default: 0,
    example: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalFileLabeled?: number = 0; //all of these will be calculated in the service, so we can set default value here

  @ApiPropertyOptional({
    description: 'Optional feedback / reason for create or recalculate',
    example: 'Manual recalculation after QA audit',
  })
  @IsOptional()
  @IsString()
  feedbacks?: string;

  @ApiPropertyOptional({
    description: 'Creation mode. Use RECALCULATED to update an existing rating',
    enum: CreateMode,
    default: CreateMode.DEFAULT,
    example: CreateMode.DEFAULT,
  })
  @IsOptional()
  @IsEnum(CreateMode)
  mode?: CreateMode = CreateMode.DEFAULT; //default is NEW, when the rating is created for the first time, it will be NEW, when the rating is recalculated, it will be RECALCULATED
}
