import { Test, TestingModule } from '@nestjs/testing';
import { AccountRatingHistoryService } from './account-rating-history.service';

describe('AccountRatingHistoryService', () => {
  let service: AccountRatingHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountRatingHistoryService],
    }).compile();

    service = module.get<AccountRatingHistoryService>(AccountRatingHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
