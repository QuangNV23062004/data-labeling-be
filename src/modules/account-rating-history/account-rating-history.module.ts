import { Module } from '@nestjs/common';
import { AccountRatingHistoryController } from './account-rating-history.controller';
import { AccountRatingHistoryService } from './account-rating-history.service';
import { AccountRatingHistoryEntity } from './account-rating-history.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountRatingHistoryRepository } from './account-rating-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AccountRatingHistoryEntity])],
  controllers: [AccountRatingHistoryController],
  providers: [AccountRatingHistoryService, AccountRatingHistoryRepository],
})
export class AccountRatingHistoryModule {}
