import { IsOptional, IsString, IsUUID } from 'class-validator';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterAccountRatingHistoryQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Free-text search keyword',
    example: 'Project completed',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by account rating ID',
    format: 'uuid',
    example: 'e4d37f68-c6a2-4a99-9656-4ef35d454f5f',
  })
  @IsOptional()
  @IsUUID()
  accountRatingId?: string;
}
