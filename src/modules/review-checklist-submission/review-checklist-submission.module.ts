import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewChecklistSubmissionController } from './review-checklist-submission.controller';
import { ReviewChecklistSubmissionService } from './review-checklist-submission.service';
import { ReviewChecklistSubmissionRepository } from './review-checklist-submission.repository';
import { ReviewChecklistSubmissionEntity } from './review-checklist-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewChecklistSubmissionEntity])],
  controllers: [ReviewChecklistSubmissionController],
  providers: [
    ReviewChecklistSubmissionService,
    ReviewChecklistSubmissionRepository,
  ],
})
export class ReviewChecklistSubmissionModule {}
