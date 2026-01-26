import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReviewErrorTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
