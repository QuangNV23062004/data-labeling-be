import { PartialType } from '@nestjs/swagger';
import { CreateReviewErrorTypeDto } from './create-review-error-type.dto';

export class UpdateReviewErrorTypeDto extends PartialType(CreateReviewErrorTypeDto) {}
