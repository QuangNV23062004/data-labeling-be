import { forwardRef, Module } from '@nestjs/common';
import { AccountRatingController } from './account-rating.controller';
import { AccountRatingService } from './account-rating.service';
import { AccountRatingRepository } from './account-rating.repository';
import { AccountRatingEntity } from './account-rating.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { ProjectModule } from '../project/project.module';
import { ReviewErrorModule } from '../review-error/review-error.module';
import { FileLabelModule } from '../file-label/file-label.module';
import { AccountRatingHistoryModule } from '../account-rating-history/account-rating-history.module';
import { AccountRatingDomain } from './account-rating.domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountRatingEntity]),
    AccountModule,
    forwardRef(() => ProjectModule),
    ReviewErrorModule,
    FileLabelModule,
    AccountRatingHistoryModule,
  ],
  controllers: [AccountRatingController],
  providers: [
    AccountRatingService,
    AccountRatingRepository,
    AccountRatingDomain,
  ],
  exports: [AccountRatingService, AccountRatingRepository],
})
export class AccountRatingModule {}
