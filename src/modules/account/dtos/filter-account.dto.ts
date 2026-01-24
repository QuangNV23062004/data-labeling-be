import { IsIn, IsOptional, IsString } from 'class-validator';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterAccountDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term', example: 'john' })
  @IsOptional()
  @IsString()
  search?: string = '';

  @ApiPropertyOptional({
    description: 'Field to search by',
    enum: ['username', 'email', 'role', 'status'],
    default: 'username',
  })
  @IsOptional()
  @IsString()
  @IsIn(['username', 'email', 'role', 'status'])
  searchBy?: string = 'username';

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['username', 'email', 'createdAt', 'updatedAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['username', 'email', 'createdAt', 'updatedAt'])
  orderBy?: string = 'createdAt';
}
