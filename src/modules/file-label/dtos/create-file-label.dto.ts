import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { FileLabelStatusEnums } from '../enums/file-label.enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFileLabelDto {
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

  @ApiProperty({
    description: 'The ID of the annotator',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  annotatorId: string;

  @ApiPropertyOptional({
    description: 'The ID of the reviewer',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  reviewerId?: string;

  @ApiPropertyOptional({
    description: 'The status of the file label',
    example: FileLabelStatusEnums.IN_PROGRESS,
    enum: FileLabelStatusEnums,
  })
  @IsOptional()
  @IsEnum(FileLabelStatusEnums)
  status?: FileLabelStatusEnums;
}
