import { Test, TestingModule } from '@nestjs/testing';
import { LabelCategoryController } from './label-category.controller';

describe('LabelCategoryController', () => {
  let controller: LabelCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelCategoryController],
    }).compile();

    controller = module.get<LabelCategoryController>(LabelCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
