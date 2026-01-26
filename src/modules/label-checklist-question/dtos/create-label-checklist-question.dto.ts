import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLabelChecklistQuestionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
