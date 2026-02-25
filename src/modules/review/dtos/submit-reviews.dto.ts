import { AnswerDataDto } from 'src/modules/checklist-answer/dtos/answer-data/answer-data.dto';
import { Decision } from '../enums/decisions.enums';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SubmitReviewErrorDto } from './submit-review-error.dto';

export class SubmitReviewsDto {
  @ApiProperty({
    description: 'Decision made during review',
    enum: Decision,
  })
  @IsNotEmpty()
  @IsEnum(Decision)
  @IsIn([Decision.APPROVED, Decision.REJECTED])
  decision: Decision;

  @ApiProperty({
    description: 'Optional feedback from the reviewer',
    example: 'The annotation is mostly good, but please check the boundaries.',
  })
  @IsOptional()
  @IsString()
  feedbacks?: string;

  @ApiProperty({
    type: () => AnswerDataDto,
    description: 'Answer data containing array of answers and optional notes',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AnswerDataDto)
  answerData: AnswerDataDto;

  @ApiProperty({
    type: () => [SubmitReviewErrorDto],
    description: 'List of errors identified during the review',
  })
  @ValidateIf((o) => o.decision === Decision.REJECTED)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1, {
    message: 'Rejected review must include at least 1 review error',
  })
  @ValidateNested({ each: true })
  @Type(() => SubmitReviewErrorDto)
  reviewErrors: SubmitReviewErrorDto[] = [];

  @ApiProperty({
    description: 'ID of the file label being reviewed',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  fileLabelId: string;
}
