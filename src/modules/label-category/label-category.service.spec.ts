import { Test, TestingModule } from '@nestjs/testing';
import { LabelCategoryService } from './label-category.service';

describe('LabelCategoryService', () => {
  let service: LabelCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LabelCategoryService],
    }).compile();

    service = module.get<LabelCategoryService>(LabelCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
