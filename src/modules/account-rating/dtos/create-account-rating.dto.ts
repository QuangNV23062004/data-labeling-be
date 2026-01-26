import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAccountRatingDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
