import { Test, TestingModule } from '@nestjs/testing';
import { LabelChecklistQuestionAnswerService } from './label-checklist-question-answer.service';

describe('LabelChecklistQuestionAnswerService', () => {
  let service: LabelChecklistQuestionAnswerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LabelChecklistQuestionAnswerService],
    }).compile();

    service = module.get<LabelChecklistQuestionAnswerService>(LabelChecklistQuestionAnswerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
