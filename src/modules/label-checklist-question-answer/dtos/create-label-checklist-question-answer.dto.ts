import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLabelChecklistQuestionAnswerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
