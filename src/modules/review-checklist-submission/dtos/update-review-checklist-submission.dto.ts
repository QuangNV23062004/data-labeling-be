import { PartialType } from '@nestjs/swagger';
import { CreateReviewChecklistSubmissionDto } from './create-review-checklist-submission.dto';

export class UpdateReviewChecklistSubmissionDto extends PartialType(CreateReviewChecklistSubmissionDto) {}
