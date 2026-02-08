import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsIn,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { AnswerTypeEnum } from '../enums/answer-type.enums';
import { Role } from 'src/modules/account/enums/role.enum';

export class FilterChecklistAnswerQueryDto extends BasePaginationQueryDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    required: false,
    description: 'Filter by file label ID',
  })
  @IsOptional()
  @IsUUID()
  fileLabelId?: string;

  @ApiProperty({
    type: 'number',
    required: false,
    minimum: 1,
    description: 'Filter by label attempt number',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  labelAttemptNumber?: number;

  @ApiProperty({
    enum: AnswerTypeEnum,
    required: false,
    description: 'Filter by answer type',
  })
  @IsOptional()
  @IsEnum(AnswerTypeEnum)
  answerType?: AnswerTypeEnum;

  @ApiProperty({
    enum: [Role.ANNOTATOR, Role.REVIEWER],
    required: false,
    description: 'Filter by role type',
  })
  @IsOptional()
  @IsEnum([Role.ANNOTATOR, Role.REVIEWER])
  roleType?: Role;

  @ApiProperty({
    enum: ['createdAt', 'updatedAt', 'label_attempt_number'],
    required: false,
    description: 'Field to order by',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'label_attempt_number'])
  orderBy?: string;

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    required: false,
    description: 'Filter by answerer ID',
  })
  @IsOptional()
  @IsUUID()
  answerById?: string;
}
