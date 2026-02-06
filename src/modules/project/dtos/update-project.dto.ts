import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString, isString } from 'class-validator';
import { DataType } from '../enums/data-type.enums';

//why use id in body ? rest api ?
export class UpdateProjectDto {
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
