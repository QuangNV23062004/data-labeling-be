import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDatasetDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
