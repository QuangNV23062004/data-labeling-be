import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsIn,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';

export class FilterAccountRatingQueryDto extends BasePaginationQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['accountId', 'projectId', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['feedbacks'])
  searchField?: string;
}
