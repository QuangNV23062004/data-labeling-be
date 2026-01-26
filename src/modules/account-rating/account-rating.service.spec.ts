import { Test, TestingModule } from '@nestjs/testing';
import { AccountRatingService } from './account-rating.service';

describe('AccountRatingService', () => {
  let service: AccountRatingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountRatingService],
    }).compile();

    service = module.get<AccountRatingService>(AccountRatingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
