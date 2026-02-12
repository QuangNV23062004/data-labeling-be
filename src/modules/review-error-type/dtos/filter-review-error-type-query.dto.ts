import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { Severity } from '../enums/severity.enums';

export class FilterReviewErrorTypeQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search term to filter results',
    example: 'missing label',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Field to search by',
    enum: ['name', 'description', 'scoreImpact'],
    example: 'name',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'description', 'scoreImpact'])
  searchBy?: string = 'name';

  @ApiPropertyOptional({
    description: 'Filter by severity level',
    enum: Severity,
    example: Severity.MODERATE,
  })
  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @ApiPropertyOptional({
    description: 'Field to order results by',
    enum: ['name', 'description', 'scoreImpact', 'createdAt', 'updatedAt'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'description', 'scoreImpact', 'createdAt', 'updatedAt'])
  orderBy?: string = 'createdAt';
}
