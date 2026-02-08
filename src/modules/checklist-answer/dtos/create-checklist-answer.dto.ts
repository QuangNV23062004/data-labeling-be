import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AnswerTypeEnum } from '../enums/answer-type.enums';
import { AnswerDataDto } from './answer-data/answer-data.dto';
import { Type } from 'class-transformer';

export class CreateChecklistAnswerDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description:
      'File Label ID - identifies which file-label pair this answer belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  fileLabelId: string;

  @ApiProperty({
    type: () => AnswerDataDto,
    description: 'Answer data containing array of answers and optional notes',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AnswerDataDto)
  answerData: AnswerDataDto;

  @ApiProperty({
    enum: AnswerTypeEnum,
    description:
      'Type of answer: SUBMIT (annotator initial), REJECTED (reviewer rejection), APPROVED (reviewer approval), RESUBMITED (annotator resubmission)',
    example: 'SUBMIT',
  })
  @IsNotEmpty()
  @IsEnum(AnswerTypeEnum)
  answerType: AnswerTypeEnum;

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description:
      'ID of the user providing this answer (set by system, not required in request)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  answerById: string;
}
