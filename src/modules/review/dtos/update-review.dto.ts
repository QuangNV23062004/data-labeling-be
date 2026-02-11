import { PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';

/**
 * Update Review DTO - All fields from CreateReviewDto are optional
 */
export class UpdateReviewDto extends PartialType(CreateReviewDto) {}
