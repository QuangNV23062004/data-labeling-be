import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsUUID,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterReviewErrorQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search term to filter results',
    example: 'missing label',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Field to search by',
    enum: ['description'],
    example: 'description',
  })
  @IsOptional()
  @IsIn(['description'])
  searchBy?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific review ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  reviewId?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific review error type ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  reviewErrorTypeId?: string;

  @ApiPropertyOptional({
    type: 'string',
    enum: ['createdAt', 'updatedAt'],
    description: 'Field to order results by',
    example: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  orderBy?: string;
}
