import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DataType } from '../enums/data-type.enums';
import { Transform } from 'class-transformer';

export class UpdateProjectDto {
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Project description',
  })
  description?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsEnum(DataType)
  @ApiPropertyOptional({
    description: 'Data type of the project',
    example: DataType.IMAGE,
    enum: DataType,
  })
  dataType?: DataType;
}
