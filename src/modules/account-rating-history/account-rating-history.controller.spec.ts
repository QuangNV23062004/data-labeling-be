import { Test, TestingModule } from '@nestjs/testing';
import { AccountRatingHistoryController } from './account-rating-history.controller';

describe('AccountRatingHistoryController', () => {
  let controller: AccountRatingHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountRatingHistoryController],
    }).compile();

    controller = module.get<AccountRatingHistoryController>(AccountRatingHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
