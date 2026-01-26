import { Test, TestingModule } from '@nestjs/testing';
import { ReviewErrorController } from './review-error.controller';

describe('ReviewErrorController', () => {
  let controller: ReviewErrorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewErrorController],
    }).compile();

    controller = module.get<ReviewErrorController>(ReviewErrorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
