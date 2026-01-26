import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReviewErrorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
