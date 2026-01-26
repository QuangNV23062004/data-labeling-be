import { Test, TestingModule } from '@nestjs/testing';
import { ReviewErrorTypeService } from './review-error-type.service';

describe('ReviewErrorTypeService', () => {
  let service: ReviewErrorTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewErrorTypeService],
    }).compile();

    service = module.get<ReviewErrorTypeService>(ReviewErrorTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
