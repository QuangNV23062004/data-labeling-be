import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MAX,
  Min,
} from 'class-validator';

export class CreateAccountRatingDto {
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsInt()
  @Max(100)
  @Min(0)
  ratingScore?: number = 100; //all of these will be calculated in the service, so we can set default value here

  @IsOptional()
  @IsInt()
  @Min(0)
  errorCount?: number = 0; //all of these will be calculated in the service, so we can set default value here

  @IsOptional()
  @IsInt()
  @Min(0)
  totalFileLabeled?: number = 0; //all of these will be calculated in the service, so we can set default value here

  @IsOptional()
  @IsString()
  feedbacks?: string;
}
