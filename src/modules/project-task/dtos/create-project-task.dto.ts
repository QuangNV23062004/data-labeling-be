import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectTaskDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
