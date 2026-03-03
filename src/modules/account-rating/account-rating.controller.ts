import { Controller, Post } from '@nestjs/common';
import { AccountRatingService } from './account-rating.service';
import { CreateAccountRatingDto } from './dtos/create-account-rating.dto';
import { AccountRatingEntity } from './account-rating.entity';

@Controller('account-ratings')
export class AccountRatingController {
  constructor(private readonly accountRatingService: AccountRatingService) {}

  @Post()
  async Create(
    createAccountRatingDto: CreateAccountRatingDto,
  ): Promise<AccountRatingEntity> {
    return this.accountRatingService.Create(createAccountRatingDto);
  }
}
