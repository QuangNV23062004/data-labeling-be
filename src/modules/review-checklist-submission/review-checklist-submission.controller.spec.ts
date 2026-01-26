import { Test, TestingModule } from '@nestjs/testing';
import { ReviewChecklistSubmissionController } from './review-checklist-submission.controller';

describe('ReviewChecklistSubmissionController', () => {
  let controller: ReviewChecklistSubmissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewChecklistSubmissionController],
    }).compile();

    controller = module.get<ReviewChecklistSubmissionController>(ReviewChecklistSubmissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
