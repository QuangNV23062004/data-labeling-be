import { IsIn, IsOptional, IsString } from 'class-validator';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { ApiPropertyOptional, ApiTags } from '@nestjs/swagger';

@ApiTags('Label Categories')
export class FilterLabelCategoryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search term to filter label categories',
    example: 'medical',
  })
  @IsOptional()
  @IsString()
  search?: string = '';

  @ApiPropertyOptional({
    description: 'Field to search by',
    enum: ['name', 'description'],
    example: 'name',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'description'])
  searchBy?: string = 'name';

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['name', 'description', 'created_at', 'updated_at'],
    example: 'created_at',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'description', 'created_at', 'updated_at'])
  orderBy?: string = 'created_at';
}
