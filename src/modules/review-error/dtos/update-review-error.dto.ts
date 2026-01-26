import { PartialType } from '@nestjs/swagger';
import { CreateReviewErrorDto } from './create-review-error.dto';

export class UpdateReviewErrorDto extends PartialType(CreateReviewErrorDto) {}
