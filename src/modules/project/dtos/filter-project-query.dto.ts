import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';

export class FilterProjectQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by project name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Include Deleted' })
  @IsOptional()
  @Type(() => Boolean)
  includeDeleted?: boolean = false;
}
