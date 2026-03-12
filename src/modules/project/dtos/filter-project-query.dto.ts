import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';

export class FilterProjectQueryDto extends BasePaginationQueryDto {
  //old query, legacy
  @ApiPropertyOptional({ description: 'Filter by project name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Search filter' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Search by filter' })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'description'])
  searchBy?: string = 'name';

  @ApiPropertyOptional({ description: 'Order by filter' })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'description', 'createdAt', 'updatedAt'])
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Include Deleted' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return false;
    }

    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }

    return Boolean(value);
  })
  includeDeleted?: boolean = false;

  @ApiPropertyOptional({ description: 'Filter by created by id' })
  @IsOptional()
  @IsString()
  createdById?: string;
}
