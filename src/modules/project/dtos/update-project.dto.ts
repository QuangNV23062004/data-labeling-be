import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsNotEmpty, IsString, isString } from 'class-validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}
