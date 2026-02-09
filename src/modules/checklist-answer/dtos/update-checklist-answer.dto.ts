import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AnswerTypeEnum } from '../enums/answer-type.enums';
import { AnswerDataDto } from './answer-data/answer-data.dto';
import { Type } from 'class-transformer';

/**
 * Only allows updating answerData and answerType
 * Prevents mutations of fileLabelId, answerById, roleType, labelAttemptNumber
 */
export class UpdateChecklistAnswerDto {
  @ApiProperty({
    type: () => AnswerDataDto,
    required: false,
    description:
      'Updated answer data. Can only be modified for latest attempt.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AnswerDataDto)
  answerData?: AnswerDataDto;

  @ApiProperty({
    enum: AnswerTypeEnum,
    required: false,
    description:
      'Only reviewers can update answerType from REJECTED to APPROVED. Restricted to specific transitions.',
    example: 'APPROVED',
  })
  @IsOptional()
  @IsEnum(AnswerTypeEnum)
  answerType?: AnswerTypeEnum;
}
