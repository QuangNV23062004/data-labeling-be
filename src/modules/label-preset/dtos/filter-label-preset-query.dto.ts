import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsArray, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterLabelPresetQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term', example: 'john' })
  @IsOptional()
  @IsString()
  search?: string = '';

  @ApiPropertyOptional({
    description: 'Field to search by',
    enum: ['name', 'description'],
    default: 'name',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'description'])
  searchBy?: string = 'name';

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['name', 'description', 'createdAt', 'updatedAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'description', 'createdAt', 'updatedAt'])
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Label Ids',
    type: 'array',
    items: { type: 'string' },
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUUID('all', { each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return value.split(',').map((v) => v.trim());
  })
  labelIds?: string[] = [];
}
