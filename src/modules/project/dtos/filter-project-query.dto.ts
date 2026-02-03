import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
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
  @Type(() => Boolean)
  includeDeleted?: boolean = false;
}
