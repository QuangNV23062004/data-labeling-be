import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FileLabelStatusEnums } from '../enums/file-label.enums';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterFileLabelQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by file ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  fileId?: string;

  @ApiPropertyOptional({
    description: 'Filter by label ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  labelId?: string;

  @ApiPropertyOptional({
    description: 'Filter by annotator ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  annotatorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by reviewer ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  reviewerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    example: FileLabelStatusEnums.IN_PROGRESS,
    enum: FileLabelStatusEnums,
  })
  @IsOptional()
  @IsEnum(FileLabelStatusEnums)
  status?: FileLabelStatusEnums;

  @ApiPropertyOptional({
    description: 'Search term',
    example: 'example',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Field to search by',
    example: 'id',
  })
  @IsOptional()
  @IsString()
  searchBy?: string = 'id';

  @ApiPropertyOptional({
    description: 'Field to order by',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Order direction',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
