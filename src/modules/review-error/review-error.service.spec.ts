import { Test, TestingModule } from '@nestjs/testing';
import { ReviewErrorService } from './review-error.service';

describe('ReviewErrorService', () => {
  let service: ReviewErrorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewErrorService],
    }).compile();

    service = module.get<ReviewErrorService>(ReviewErrorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
