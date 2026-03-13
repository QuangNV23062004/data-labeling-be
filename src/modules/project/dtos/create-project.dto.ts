import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { DataType } from '../enums/data-type.enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { File } from 'buffer';
import { Transform } from 'class-transformer';

export class CreateProjectDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Project description',
  })
  description?: string;

  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsEnum(DataType)
  @ApiProperty({
    description: 'Data type of the project',
    example: DataType.IMAGE,
    enum: DataType,
  })
  dataType: DataType;

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  availableLabelIds: string[];
}
