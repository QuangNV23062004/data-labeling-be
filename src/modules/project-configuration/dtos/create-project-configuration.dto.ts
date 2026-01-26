import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectConfigurationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
