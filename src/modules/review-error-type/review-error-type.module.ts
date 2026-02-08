import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewErrorTypeController } from './review-error-type.controller';
import { ReviewErrorTypeService } from './review-error-type.service';
import { ReviewErrorTypeRepository } from './review-error-type.repository';
import { ReviewErrorTypeEntity } from './review-error-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewErrorTypeEntity])],
  controllers: [ReviewErrorTypeController],
  providers: [ReviewErrorTypeService, ReviewErrorTypeRepository],
  exports: [ReviewErrorTypeService, ReviewErrorTypeRepository],
})
export class ReviewErrorTypeModule {}
