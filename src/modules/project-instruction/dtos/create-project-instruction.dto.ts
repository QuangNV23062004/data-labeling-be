import { IsNotEmpty, IsString } from 'class-validator';


export class CreateProjectInstructionDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;
  
  @IsNotEmpty()
  @IsString()
  title: string;
  
  @IsNotEmpty()
  @IsString()
  content: string;
}
