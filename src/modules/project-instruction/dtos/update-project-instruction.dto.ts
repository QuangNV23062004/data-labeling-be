import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateProjectInstructionDto } from './create-project-instruction.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProjectInstructionDto {
  @IsNotEmpty()
  @IsString()
  title: string;
  
  @IsNotEmpty()
  @IsString()
  content: string;
}
