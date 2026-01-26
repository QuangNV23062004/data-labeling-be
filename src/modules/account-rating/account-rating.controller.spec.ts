import { Test, TestingModule } from '@nestjs/testing';
import { AccountRatingController } from './account-rating.controller';

describe('AccountRatingController', () => {
  let controller: AccountRatingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountRatingController],
    }).compile();

    controller = module.get<AccountRatingController>(AccountRatingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
