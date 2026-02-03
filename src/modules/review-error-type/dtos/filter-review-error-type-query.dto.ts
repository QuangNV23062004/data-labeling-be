import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { Severity } from '../enums/severity.enums';

export class FilterReviewErrorTypeQueryDto extends BasePaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'description', 'scoreImpact'])
  searchBy?: string = 'name';

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'description', 'scoreImpact', 'createdAt', 'updatedAt'])
  orderBy?: string = 'createdAt';
}
