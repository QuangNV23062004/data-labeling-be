import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
} from 'class-validator';
import { AnswerTypeEnum } from '../enums/answer-type.enums';
import { AnswerDataDto } from './answer-data/answer-data.dto';
import { Type } from 'class-transformer/types/decorators/type.decorator';

export class CreateChecklistAnswerDto {
  @IsNotEmpty()
  @IsUUID()
  fileLabelId: string;

  @IsNotEmpty()
  @Type(() => AnswerDataDto)
  answerData: AnswerDataDto;

  @IsNotEmpty()
  @IsEnum(AnswerTypeEnum)
  answerType: AnswerTypeEnum;

  @IsNotEmpty()
  @IsUUID()
  answerById: string;
}
