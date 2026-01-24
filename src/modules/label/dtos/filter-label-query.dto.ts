import { ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';

@ApiTags('Labels')
export class FilterLabelQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term', example: 'john' })
  @IsOptional()
  @IsString()
  search?: string = '';

  @ApiPropertyOptional({
    description: 'Field to search by',
    enum: ['name', 'description', 'color'],
    default: 'name',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'description', 'color'])
  searchBy?: string = 'name';

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['name', 'description', 'color', 'createdAt', 'updatedAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'description', 'color', 'createdAt', 'updatedAt'])
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Array of Label Category IDs to filter by',
    example: ['uuid1', 'uuid2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return value.split(',').map((v) => v.trim());
  })
  categoryIds?: string[];
}
