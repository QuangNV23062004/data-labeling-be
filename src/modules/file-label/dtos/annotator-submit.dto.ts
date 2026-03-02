import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { FileLabelStatusEnums } from '../enums/file-label.enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnswerDataDto } from 'src/modules/checklist-answer/dtos/answer-data/answer-data.dto';
import { Type } from 'class-transformer';

export class AnnotatorSubmitDto {
  @ApiProperty({
    description: 'The ID of the file to label',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  fileId: string;

  @ApiProperty({
    description: 'The ID of the label to apply',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  labelId: string;

  @ApiPropertyOptional({
    description: 'The status of the file label',
    example: FileLabelStatusEnums.PENDING_REVIEW,
    enum: FileLabelStatusEnums,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(FileLabelStatusEnums)
  status?: FileLabelStatusEnums = FileLabelStatusEnums.PENDING_REVIEW;

  @ApiProperty({
    type: () => AnswerDataDto,
    description: 'Answer data containing array of answers and optional notes',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AnswerDataDto)
  answerData: AnswerDataDto;
}
