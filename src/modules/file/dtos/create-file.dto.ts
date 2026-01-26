import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFileDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
