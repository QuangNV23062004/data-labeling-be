import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectInstructionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
