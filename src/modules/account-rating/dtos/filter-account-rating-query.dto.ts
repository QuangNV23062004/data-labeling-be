import { IsOptional, IsString, IsIn, IsUUID } from 'class-validator';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterAccountRatingQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['accountId', 'projectId', 'createdAt', 'updatedAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['accountId', 'projectId', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Filter by account ID',
    format: 'uuid',
    example: '96b6d3f2-3e58-4be1-9bc2-0de3c2a2d890',
  })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({
    description: 'Filter by project ID',
    format: 'uuid',
    example: '2cf08fd8-cf3e-4e0f-aea8-b1f2ec6d8ae6',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Free-text search keyword',
    example: 'audit',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Field used for text search',
    enum: ['feedbacks'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['feedbacks'])
  searchField?: string;
}
