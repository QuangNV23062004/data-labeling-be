import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReviewChecklistSubmissionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
