import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsNotEmpty, IsOptional, IsString, isString } from 'class-validator';

//why use id in body ? rest api ?
export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @ApiProperty()
  @IsString()
  id: string;
}
