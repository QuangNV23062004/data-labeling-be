import { Test, TestingModule } from '@nestjs/testing';
import { ReviewChecklistSubmissionService } from './review-checklist-submission.service';

describe('ReviewChecklistSubmissionService', () => {
  let service: ReviewChecklistSubmissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewChecklistSubmissionService],
    }).compile();

    service = module.get<ReviewChecklistSubmissionService>(ReviewChecklistSubmissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
