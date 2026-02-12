import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewErrorController } from './review-error.controller';
import { ReviewErrorService } from './review-error.service';
import { ReviewErrorRepository } from './review-error.repository';
import { ReviewErrorEntity } from './review-error.entity';
import { ReviewModule } from '../review/review.module';
import { ReviewErrorTypeModule } from '../review-error-type/review-error-type.module';
import { ReviewErrorDomain } from './review-error.domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewErrorEntity]),
    ReviewModule,
    ReviewErrorTypeModule,
  ],
  controllers: [ReviewErrorController],
  providers: [ReviewErrorService, ReviewErrorRepository, ReviewErrorDomain],
  exports: [ReviewErrorService, ReviewErrorRepository, ReviewErrorDomain],
})
export class ReviewErrorModule {}
