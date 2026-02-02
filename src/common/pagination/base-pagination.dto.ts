import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BasePaginationQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort order', default: 'DESC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: string = 'DESC';
}
