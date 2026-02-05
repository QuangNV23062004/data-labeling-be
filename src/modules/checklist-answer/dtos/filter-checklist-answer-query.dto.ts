import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsIn,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { AnswerTypeEnum } from '../enums/answer-type.enums';
import { Role } from 'src/modules/account/enums/role.enum';

export class FilterChecklistAnswerQueryDto extends BasePaginationQueryDto {
  @IsOptional()
  @IsUUID()
  fileLabelId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  labelAttemptNumber?: number;

  @IsOptional()
  @IsEnum(AnswerTypeEnum)
  answerType?: AnswerTypeEnum;

  @IsOptional()
  @IsEnum([Role.ANNOTATOR, Role.REVIEWER])
  roleType?: Role;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'label_attempt_number'])
  orderBy?: string;

  @IsOptional()
  @IsUUID()
  answerById?: string;
}
