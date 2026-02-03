import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DataType } from '../enums/data-type.enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { File } from 'buffer';

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
  @IsEnum(DataType)
  @ApiProperty({
    description: 'Data type of the project',
    example: DataType.IMAGE,
    enum: DataType,
  })
  dataType: DataType;
}
