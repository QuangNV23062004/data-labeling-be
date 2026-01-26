import { Test, TestingModule } from '@nestjs/testing';
import { ReviewErrorTypeController } from './review-error-type.controller';

describe('ReviewErrorTypeController', () => {
  let controller: ReviewErrorTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewErrorTypeController],
    }).compile();

    controller = module.get<ReviewErrorTypeController>(ReviewErrorTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
