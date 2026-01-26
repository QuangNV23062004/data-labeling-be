import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFileLabelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
