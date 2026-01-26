import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewErrorController } from './review-error.controller';
import { ReviewErrorService } from './review-error.service';
import { ReviewErrorRepository } from './review-error.repository';
import { ReviewErrorEntity } from './review-error.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewErrorEntity])],
  controllers: [ReviewErrorController],
  providers: [ReviewErrorService, ReviewErrorRepository],
})
export class ReviewErrorModule {}
