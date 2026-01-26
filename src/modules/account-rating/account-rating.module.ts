import { Module } from '@nestjs/common';
import { AccountRatingController } from './account-rating.controller';
import { AccountRatingService } from './account-rating.service';
import { AccountRatingRepository } from './account-rating.repository';
import { AccountRatingEntity } from './account-rating.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccountRatingEntity])],
  controllers: [AccountRatingController],
  providers: [AccountRatingService, AccountRatingRepository],
})
export class AccountRatingModule {}
