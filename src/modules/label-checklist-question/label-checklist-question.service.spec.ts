import { Test, TestingModule } from '@nestjs/testing';
import { LabelChecklistQuestionService } from './label-checklist-question.service';

describe('LabelChecklistQuestionService', () => {
  let service: LabelChecklistQuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LabelChecklistQuestionService],
    }).compile();

    service = module.get<LabelChecklistQuestionService>(LabelChecklistQuestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
