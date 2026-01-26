import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAccountRatingHistoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
