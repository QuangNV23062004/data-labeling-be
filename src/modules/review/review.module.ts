import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewRepository } from './review.repository';
import { ReviewEntity } from './review.entity';
import { ChecklistAnswerModule } from '../checklist-answer/checklist-answer.module';
import { AccountModule } from '../account/account.module';
import { ReviewErrorModule } from '../review-error/review-error.module';
import { ReviewErrorTypeModule } from '../review-error-type/review-error-type.module';
import { FileLabelModule } from '../file-label/file-label.module';
import { LabelChecklistQuestionModule } from '../label-checklist-question/label-checklist-question.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity]),
    ChecklistAnswerModule,
    AccountModule,
    forwardRef(() => ReviewErrorModule),
    ReviewErrorTypeModule,
    FileLabelModule,
    LabelChecklistQuestionModule,
    NotificationModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
