import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsIn,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { Role } from 'src/modules/account/enums/role.enum';

export class FilterLabelChecklistQuestionQueryDto extends BasePaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'description'])
  searchBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'description', 'createdAt', 'updatedAt'])
  orderBy?: string;

  @IsOptional()
  @IsUUID()
  labelId?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsIn([Role.ANNOTATOR, Role.REVIEWER])
  role?: Role;
}
