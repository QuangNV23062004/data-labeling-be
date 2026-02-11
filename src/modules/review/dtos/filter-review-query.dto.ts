import { IsOptional, IsString, IsUUID, IsEnum, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { Decision } from '../enums/decisions.enums';

export class FilterReviewQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    description: 'Filter by file label ID',
  })
  @IsOptional()
  @IsUUID()
  fileLabelId?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    description: 'Filter by reviewer ID',
  })
  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Search term to filter reviews',
    default: '',
  })
  @IsOptional()
  @IsString()
  search?: string = '';

  @ApiPropertyOptional({
    type: 'string',
    enum: ['feedbacks'],
    description: 'Field to search in',
    default: 'feedbacks',
  })
  @IsOptional()
  @IsIn(['feedbacks'])
  searchBy?: string = 'feedbacks';

  @ApiPropertyOptional({
    enum: Decision,
    description: 'Filter by review decision',
  })
  @IsOptional()
  @IsEnum(Decision)
  decision?: Decision;

  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    description: 'Filter by checklist answer ID',
  })
  @IsOptional()
  @IsUUID()
  checklistAnswerId?: string;

  @ApiPropertyOptional({
    type: 'string',
    enum: ['createdAt', 'updatedAt', 'reviewedAt'],
    description: 'Field to order results by',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'reviewedAt'])
  orderBy?: string;
}
