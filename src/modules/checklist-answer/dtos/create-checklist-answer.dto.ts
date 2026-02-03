import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChecklistAnswerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
